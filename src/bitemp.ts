
export type Observation<V> = {
    event_time: number;
    ingestion_time: number;
    evt: V;
};

export type Doc<V> = Observation<V>[];

export type CutOff = { ingestion_time?: number, event_time?: number }

  export function observe<V>(doc: Doc<V>, ingestion_time: number, evt: any, event_time: number): Doc<V> {
    return [...doc, { event_time, ingestion_time, evt }];
}

export function latest<V>(d: Doc<V>, cut_off: {
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

export function latest_matching<V>(doc: Doc<V>, matches: Doc<V>, cut_off: CutOff = {}) {
    const l = latest(doc, cut_off)
    if (l && matches.includes(l)) {
        return l
    }
    return undefined
}