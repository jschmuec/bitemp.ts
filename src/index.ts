import * as bt from "./bitemp.js"

// create a sample data structure
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
let position: bt.Observation<Swap>[] = []

let swap: Swap = {
    trade_id: "667",
    book: "USD",
    notional: "100k",
    fixings: [{ fixing_date: "2023-01-02", pay_date: "2023-01-04" },
    { fixing_date: "2023-04-03", pay_date: "2023-04-05" }
    ]
}

console.log("First version of an IRS:");
console.log( swap );

let fixed_swap: Swap = { ...swap, notional: "500k" }

var p = bt.observe(position, 1.1, swap, 1)
p = bt.observe(p, 4.1, fixed_swap, 1)

console.log(p)

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
