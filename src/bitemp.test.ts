type Observation<V> = {
    event_time: number;
    ingestion_time: number;
    evt: V;
};

type Doc<V> = Observation<V>[];

type CutOff = { ingestion_time?: number, event_time?: number }

function observe<V>(doc: Doc<V>, ingestion_time: number, evt: any, event_time: number): Doc<V> {
    return [...doc, { event_time, ingestion_time, evt }];
}

function latest<V>(d: Doc<V>, cut_off: {
    event_time?: number,
    ingestion_time?: number
} = {}) {
    return d.reduce((prev: Observation<V> | undefined,
        agg: Observation<V>, currentIndex: number, d: Doc<V>) => {
        // filter out events that happened
        if ((cut_off.ingestion_time && agg.ingestion_time > cut_off.ingestion_time)
            || (cut_off.event_time && agg.event_time > cut_off.event_time)) {
            return prev;
        }

        // pick the newest version
        if (prev && (prev.event_time > agg.event_time
            || (prev.event_time == agg.event_time
                && prev.ingestion_time > agg.ingestion_time))) {
            return prev
        } else {
            return agg;
        }
    }, undefined);
}

function latest_matching<V>(doc: Doc<V>, matches: Doc<V>, cut_off: CutOff = {}) {
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

    describe("aggregate over documents in a stored proc/aggregation pipeline", () => {
        it.todo("implement the aggregation pipelines first stages")
    })
})

type Fixing = {
    fixing_date: string,
    pay_date: string,
    fixed_rate?: string
}

type Swap = {
    trade_id: string,
    book: string,
    notional: string
    fixings: Fixing[]
}

//describe("bitemporal swaps", () => {
// just some example code to see how this could be used
let position: Observation<Swap>[] = []

let swap: Swap = {
    trade_id: "667",
    book: "USD",
    notional: "100k",
    fixings: [{ fixing_date: "2023-01-02", pay_date: "2023-01-04" },
    { fixing_date: "2023-04-03", pay_date: "2023-04-05" }
    ]
}

if (false) {
    let fixed_swap: Swap = { ...swap, notional: "500k" }

    var p = observe(position, 1.1, swap, 1)
    p = observe(p, 4.1, fixed_swap, 1)

    console.log(p)
}

// data structures for easy testing
var r = [
    {
        "event_time": 1,
        "ingestion_time": 1.1,
        "evt": {
            "trade_id": "667", "book": "USD", "notional": "100k",
            "fixings": [
                { "fixing_date": "2023-01-02", "pay_date": "2023-01-04" },
                { "fixing_date": "2023-04-03", "pay_date": "2023-04-05" }
            ]
        }
    }
]

var r2 =
    [
        {
            event_time: 1,
            ingestion_time: 1.1,
            evt: {
                trade_id: '667',
                book: 'USD',
                notional: '100k',
                fixings: [Array]
            }
        },
        {
            event_time: 1,
            ingestion_time: 4.1,
            evt: {
                trade_id: '667',
                book: 'USD',
                notional: '500k',
                fixings: [Array]
            }
        }
    ]

//})
