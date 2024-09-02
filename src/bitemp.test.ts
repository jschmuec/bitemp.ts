import { observe, latest, latest_matching, Observation, Doc } from "./bitemp.js"

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
