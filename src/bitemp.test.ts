type Observation = { 
    event_time: number; 
    system_time: number; 
    evt: any;
};

type Doc = Observation[];

const observe = (doc: Doc, clock: () => number, id: string, evt: any, event_time: number): Doc => 
    [...doc, { event_time, system_time: clock(), evt }];

const latest = (d: Doc ) => {
    return ( d && d.length > 0 ) ? d[0] : undefined;
}

describe("bitemporal overlay", () => {
    var doc: Doc;
    const e100s100 = { comment: "e 100 s 100" };
    const e050s200 = { comment: "e 050 s 200" };

    beforeEach(() => {
        doc = [] as Doc;

        doc = observe(doc, () => 100, "1", e100s100, 100);
        doc = observe(doc, () => 200, "1", e050s200, 50);
    })

    test("latest() should return the highest ", () => {
        expect(latest(doc)?.evt).toEqual(e100s100);
    })

    it.todo("implement");
})