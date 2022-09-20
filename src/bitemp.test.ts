type Observation = {
    event_time: number;
    system_time: number;
    evt: any;
};

type Doc = Observation[];

const observe = (doc: Doc, clock: () => number, id: string, evt: any, event_time: number): Doc =>
    [...doc, { event_time, system_time: clock(), evt }];

const latest = (d: Doc, { event_time = undefined, system_time = undefined }: { event_time?: number, system_time?: number } = {}) =>
    d.reduce((prev: Observation | undefined, current: Observation, currentIndex: number, d: Doc) => {
        if (system_time) {
            if (current.system_time > system_time) {
                return prev;
            }
        }
        if (event_time) {
            if (current.event_time > event_time) {
                return prev;
            }
        }

        if (prev && (prev.event_time > current.event_time || (prev.event_time == current.event_time && prev.system_time > current.system_time))) {
            return prev
        } else {
            return current;
        }
    }, undefined);

describe("bitemporal overlay", () => {
    var doc: Doc;

    beforeEach(() => {
        doc = [] as Doc;

        doc = observe(doc, () => 0, "1", { e: 0, s: 0 }, 0);
        doc = observe(doc, () => 100, "1", { e: 100, s: 100 }, 100);
        doc = observe(doc, () => 200, "1", { e: 50, s: 200 }, 50);
        doc = observe(doc, () => 300, "1", { e: 100, s: 300 }, 100);
    })

    test("latest() should return the observation with the highest event and system time", () => {
        expect(latest(doc)?.evt).toEqual({ e: 100, s: 300 });
    })

    test("get the observation that happend before 50", () => {
        expect(latest(doc, { system_time: 50 })?.evt).toEqual({ e: 0, s: 0 });
    })

    test("get the state as per event_time 75", () => {
        expect(latest(doc, { event_time: 75 })?.evt).toEqual({ e: 50, s: 200 });
    })

    test("get the state as per system_time 125 and event_time 125", () => {
        expect(latest(doc, { event_time: 125, system_time: 125 })?.evt).toEqual({ e: 100, s: 100 });
    }
    );

    it.todo("implement");
})