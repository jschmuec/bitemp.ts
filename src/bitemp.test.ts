type Observation<V> = {
    event_time: number;
    ingestion_time: number;
    evt: V;
};

type Doc<V> = Observation<V>[];

function observe<V>(doc: Doc<V>, ingestion_time: number, evt: any, event_time: number): Doc<V> {
    return [...doc, { event_time, ingestion_time, evt }];
}

function latest<V>(d: Doc<V>, cut_off: { event_time?: number, ingestion_time?: number } = {}) {
    return d.reduce((prev: Observation<V> | undefined, current: Observation<V>, currentIndex: number, d: Doc<V>) => {
        if (cut_off.ingestion_time != undefined) {
            if (current.ingestion_time > cut_off.ingestion_time) {
                return prev;
            }
        }
        if (cut_off.event_time) {
            if (current.event_time > cut_off.event_time) {
                return prev;
            }
        }

        if (prev && (prev.event_time > current.event_time || (prev.event_time == current.event_time && prev.ingestion_time > current.ingestion_time))) {
            return prev
        } else {
            return current;
        }
    }, undefined);
}


function latest_matching<V>(doc: Doc<V>, matches: Doc<V>, cut_off: { ingestion_time?: number, event_time?: number } = {}) {
    const l = latest(doc, cut_off)
    if (l && matches.includes(l)) {
        return l
    }
    return undefined
}

describe("bitemporal overlay", () => {

    let events: { ingestion_time: number, event_time: number }[] =
        [{ ingestion_time: 0, event_time: 0 },
        { ingestion_time: 100, event_time: 100 },
        { ingestion_time: 200, event_time: 50 },
        { ingestion_time: 300, event_time: 100 },
        { ingestion_time: 400, event_time: 200 },
        ];

    let doc = events.reduce((doc, evt) => observe(doc, evt.ingestion_time, `s: ${evt.ingestion_time}, e: ${evt.event_time}`, evt.event_time), [] as Doc<string>)

    describe("picking the rights version", () => {
        test("latest() should return the observation with the highest event and system time", () => {
            expect(latest(doc)?.evt).toEqual("s: 400, e: 200");
        })

        test("get the observation that happend before 50", () => {
            expect(latest(doc, { ingestion_time: 50 })?.evt).toEqual("s: 0, e: 0");
        })

        test("get the state as per event_time 75", () => {
            expect(latest(doc, { event_time: 75 })?.evt).toEqual("s: 200, e: 50");
        })

        test("get the state as per system_time 125 and event_time 125", () => {
            expect(latest(doc, { event_time: 125, ingestion_time: 125 })?.evt).toEqual("s: 100, e: 100");
        }
        );

        test("get the state as per system_time 300 and event_time 125", () => {
            expect(latest(doc, { event_time: 125, ingestion_time: 300 })?.evt).toEqual("s: 300, e: 100");
        }
        );
    })

    describe("Testing with filters", () => {
        test("if all versions match, get the latest", () => {
            expect(latest_matching(doc, doc, {})?.evt).toEqual(latest(doc)?.evt)
        })
        test("if the latest is not matching return undefined", () => {
            expect(latest_matching(doc, [].slice(1), { ingestion_time: 50 })).toBeUndefined;
        })
    })

    describe("running this on MongoDB", () =>
        it.todo("figure out how to get the full document and the mapping sub-documents back at the same time"))

    describe("aggregate over documents in a stored proc/aggregation pipeline", () => {
        it.todo("implement the aggregation pipelines first stages")
    })

    describe("use timeseries in MongoDB", () =>
        it.todo("for highly mutable data with sparse overrides, e.g. market data, try it out"))
})
