var states = [
              {name: "United States" ,abbrev:"US", fips : 'us'},
              {name:"Alabama",abbrev:"AL",fips:"01"},
              {name:"Alaska",abbrev:"AK",fips:"02"},
              {name:"Arizona",abbrev:"AZ",fips:"04"},
              {name:"Arkansas",abbrev:"AR",fips:"05"},
              {name:"California",abbrev:"CA",fips:"06"},
              {name:"Colorado",abbrev:"CO",fips:"08"},
              {name:"Connecticut",abbrev:"CT",fips:"09"},
              {name:"Delaware",abbrev:"DE",fips:"10"},
              {name:"District of Columbia",abbrev:"DC",fips:"11"},
              {name:"Florida",abbrev:"FL",fips:"12"},
              {name:"Georgia",abbrev:"GA",fips:"13"},
              {name:"Hawaii",abbrev:"HI",fips:"15"},
              {name:"Idaho",abbrev:"ID",fips:"16"},
              {name:"Illinois",abbrev:"IL",fips:"17"},
              {name:"Indiana",abbrev:"IN",fips:"18"},
              {name:"Iowa",abbrev:"IA",fips:"19"},
              {name:"Kansas",abbrev:"KS",fips:"20"},
              {name:"Kentucky",abbrev:"KY",fips:"21"},
              {name:"Louisiana",abbrev:"LA",fips:"22"},
              {name:"Maine",abbrev:"ME",fips:"23"},
              {name:"Maryland",abbrev:"MD",fips:"24"},
              {name:"Massachusetts",abbrev:"MA",fips:"25"},
              {name:"Michigan",abbrev:"MI",fips:"26"},
              {name:"Minnesota",abbrev:"MN",fips:"27"},
              {name:"Mississippi",abbrev:"MS",fips:"28"},
              {name:"Missouri",abbrev:"MO",fips:"29"},
              {name:"Montana",abbrev:"MT",fips:"30"},
              {name:"Nebraska",abbrev:"NE",fips:"31"},
              {name:"Nevada",abbrev:"NV",fips:"32"},
              {name:"New Hampshire",abbrev:"NH",fips:"33"},
              {name:"New Jersey",abbrev:"NJ",fips:"34"},
              {name:"New Mexico",abbrev:"NM",fips:"35"},
              {name:"New York",abbrev:"NY",fips:"36"},
              {name:"North Carolina",abbrev:"NC",fips:"37"},
              {name:"North Dakota",abbrev:"ND",fips:"38"},
              {name:"Ohio",abbrev:"OH",fips:"39"},
              {name:"Oklahoma",abbrev:"OK",fips:"40"},
              {name:"Oregon",abbrev:"OR",fips:"41"},
              {name:"Pennsylvania",abbrev:"PA",fips:"42"},
              {name:"Rhode Island",abbrev:"RI",fips:"44"},
              {name:"South Carolina",abbrev:"SC",fips:"45"},
              {name:"South Dakota",abbrev:"SD",fips:"46"},
              {name:"Tennessee",abbrev:"TN",fips:"47"},
              {name:"Texas",abbrev:"TX",fips:"48"},
              {name:"Utah",abbrev:"UT",fips:"49"},
              {name:"Vermont",abbrev:"VT",fips:"50"},
              {name:"Virginia",abbrev:"VA",fips:"51"},
              {name:"Washington",abbrev:"WA",fips:"53"},
              {name:"West Virginia",abbrev:"WV",fips:"54"},
              {name:"Wisconsin",abbrev:"WI",fips:"55"},
              {name:"Wyoming",abbrev:"WY",fips:"56"}
            ];

var stateList = document.getElementById('state-list');
states.forEach( (state, index) => {
    var opt = document.createElement('option');
    opt.innerHTML = state.name;
    opt.value = state.fips;
    opt.name = state.name;
    stateList.appendChild(opt);
})
