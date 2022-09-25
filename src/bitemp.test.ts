type Observation = {
    event_time: number;
    ingestion_time: number;
    evt: any;
};

type Doc = Observation[];

const observe = (doc: Doc, ingestion_time: number, evt: any, event_time: number): Doc =>
    [...doc, { event_time, ingestion_time, evt }];

const latest = (d: Doc, { event_time = undefined, system_cut_off = undefined }: { event_time?: number, system_cut_off?: number } = {}) =>
    d.reduce((prev: Observation | undefined, current: Observation, currentIndex: number, d: Doc) => {
        if (system_cut_off != undefined) {
            if (current.ingestion_time > system_cut_off) {
                return prev;
            }
        }
        if (event_time) {
            if (current.event_time > event_time) {
                return prev;
            }
        }

        if (prev && (prev.event_time > current.event_time || (prev.event_time == current.event_time && prev.ingestion_time > current.ingestion_time))) {
            return prev
        } else {
            return current;
        }
    }, undefined);

describe("bitemporal overlay", () => {
    var doc: Doc;

    beforeEach(() => {
        doc = [] as Doc;

        let events: { ingestion_time: number, event_time: number }[] =
            [{ ingestion_time: 0, event_time: 0 },
            { ingestion_time: 100, event_time: 100 },
            { ingestion_time: 200, event_time: 50 },
            { ingestion_time: 300, event_time: 100 },
            { ingestion_time: 400, event_time: 200 },
            ];

        doc = events.reduce((doc, evt) => observe(doc, evt.ingestion_time, `s: ${evt.ingestion_time}, e: ${evt.event_time}`, evt.event_time), doc)
    })

    test("latest() should return the observation with the highest event and system time", () => {
        expect(latest(doc)?.evt).toEqual("s: 400, e: 200");
    })

    test("get the observation that happend before 50", () => {
        expect(latest(doc, { system_cut_off: 50 })?.evt).toEqual("s: 0, e: 0");
    })

    test("get the state as per event_time 75", () => {
        expect(latest(doc, { event_time: 75 })?.evt).toEqual("s: 200, e: 50");
    })

    test("get the state as per system_time 125 and event_time 125", () => {
        expect(latest(doc, { event_time: 125, system_cut_off: 125 })?.evt).toEqual("s: 100, e: 100");
    }
    );

    test("get the state as per system_time 300 and event_time 125", () => {
        expect(latest(doc, { event_time: 125, system_cut_off: 300 })?.evt).toEqual("s: 300, e: 100");
    }
    );
})

describe("Testing with filters", () => {
    it.todo("Push filter into aggregation pipeline");
})