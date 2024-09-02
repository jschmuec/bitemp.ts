import { observe, Observation, latest } from "./bitemp"

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
let position: Observation<Swap>[] = []

let swap: Swap = {
    trade_id: "667",
    book: "USD",
    notional: "100k",
    fixings: [{ fixing_date: "2023-01-02", pay_date: "2023-01-04" },
    { fixing_date: "2023-04-03", pay_date: "2023-04-05" }
    ]
}

function logjson( json : any ) {
    console.log("```json")
    console.log(JSON.stringify( json ))
    console.log("```")
}

console.log("# Storing the initial version\n")
console.log("## First version of an IRS:\n");
logjson( swap )


console.log("## Observing this version at 1.1 as it was created at time 1.0\n");
var p =  observe(position, 1.1, swap, 1.0)

logjson( p )

console.log("# Changing the swap at time 4.1\n")
let fixed_swap: Swap = { ...swap, notional: "500k" }
p =  observe(p, 4.1, fixed_swap, 1)

console.log("The fixed swap looks like this\n")
logjson(fixed_swap)
console.log("## And the document looks like this now:")
logjson(p)

function header( s : any ) {
    console.log( `# ${s}`)
}

header( "Now we retrieve the swap as per time 2.0")
logjson( latest( p, { event_time: 1, ingestion_time: 1.1 } ) )

// data structures to play aroudn with
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