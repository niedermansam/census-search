let display = acs2016;
var userData = [];
let data;

let percentFormat = wNumb({
  decimals: 2,
  suffix: '%'
})

let milFormat = wNumb({
  mark: '.',
  thousand: ',',
  decimals: 2,
  encoder: function( value ){
			return value / 1000000;
		},
  decoder:  function( value ){
			return value * 1000000;
		},
    suffix: 'M'
})

let thousandFormat = wNumb({
  mark: '.',
  thousand: ',',
  decimals: 2,
  encoder: function( value ){
			return value / 1000;
		},
  decoder:  function( value ){
			return value * 1000;
		},
    suffix: 'K'
})

let noFormat = wNumb({
  mark: '.',
  thousand: ',',
  decimals: 0,
})

let years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];

/* Custom filtering function which will filter data by concept and/or label*/
$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {

        var labelFilter = $('#label').val().toProperCase();
        var label = data[1]

        var conceptFilter = $('#concept').val().toProperCase();
        var concept = data[2];

        if (
            ( !labelFilter && !conceptFilter ) ||
            ( label.match(labelFilter) && !conceptFilter ) ||
            ( concept.match(conceptFilter) && !labelFilter) ||
            ( label.match(labelFilter) && concept.match(conceptFilter) )
            )
        {
            return true;
        }
        return false;
    }
);

document.querySelector('#reload').style.display = "none";

$(document).ready(function() {

  document.querySelector('.loader').style.display = "none"

    display.map(d => {
      d.label = d.label.replace(/!!/g," ").toProperCase();
      d.concept = d.concept.toProperCase();
    })

    var table = $('#table').DataTable( {
        data: display,
        responsive: true,
        columns: [
            { data: 'name' },
            { data: 'label' },
            { data: 'concept' }
        ]
    } );

    // Event listener to the two range filtering inputs to redraw on input
    $('#label, #concept').change( function() {
        table.draw();
    } );

    function getData(){
    if ( $(this).hasClass('selected') ) {

            }
            else {
                table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
            }
                 data = table.row(this).data();
                 drawGraph();
                 return data;
          }



    function drawGraph() {

      document.querySelector('.loader').style.display = "";
      let foo = table.$('tr.selected')

      try {
          document.querySelector('.plot-container').style.opacity = '0';
      } catch (e) {

      }

      let getVar;

      try {
        getVar = foo[0].getElementsByTagName('td')[0].innerHTML;
      } catch (e) {
        document.querySelector('.loader').style.display = "none";
        return;
      }

      // Hide error bar and reload button
      document.querySelector('#api-error').style.display = "none";
      document.querySelector('#reload').style.display = "none";

      // Get fips codes for state/place from user input
      selectedState = document.querySelector('#state-list').value;
      selectedArea = document.querySelector('#area-list').value;

      // handle selected state
      if(selectedState != 'us'){
        selectedState = "&for=state:" + selectedState; // handle request for a single state
      } else {
          selectedState = "&for=" + selectedState; // handle special case of full US request
      }

      if(selectedArea != ""){
        selectedState = "&in=state:" + selectedArea.match(/^../) // add state if user includes filter
        selectedArea = "&for=place:" + selectedArea.match(/.....$/) // add place if user includes filter
      }

      // Make API calls to gather ACS data
      let promisesArr = [];

       for(let i of years) {
         // compose url from user input
         url = `https://api.census.gov/data/${i}/acs/acs1?` +
                `get=NAME,${getVar}E,${getVar}M${selectedArea}${selectedState}&` +
                `key=6bf6ebcdeb96c3c930719fbcd5c1a08d713eea35`

         // Make API calls for each year in array
         let api_call = fetch(url)
                    .then(resp => resp.json())
                    .then(resp => {
                      return {value: resp[1][1], moe: resp[1][2], year: i} // collect data into object
                    });

         promisesArr.push(api_call);

      }

      // Code to run once all API calls have been made
      Promise.all(promisesArr).then(values => {




        // Create error array
        let errorArray = values.map(x => {
          let int = parseInt(x.moe)
          // correct "Estimate Total" variable by replacing negative errors with 0
          if (int < 0){ return 0; } else { return int; }
        });

        // Create array of estimates
        let estimateArray = values.map(x => x.value)


        document.querySelector('#output-data').innerHTML = "";

        out_df = document.createElement("TABLE");
        year = document.createElement('tr');
        est = document.createElement('tr');
        moe = document.createElement('tr');
        change = document.createElement('tr');
        total_change = document.createElement('tr');
        out_df.appendChild(year);
        out_df.appendChild(est);
        out_df.appendChild(moe);
        out_df.appendChild(change);
        out_df.appendChild(total_change);

        function getMagnitude(num) {
          let est_formatted;
          let est_label;

          if( Math.abs(parseInt(num)) >= 1000000){
            est_formatted = milFormat.to(parseInt(num));
            est_label = "(in Millions)"
          } else if ( Math.abs(parseInt(num)) >= 10000 ) {
            est_formatted = thousandFormat.to(parseInt(num));
            est_label = "(in Thousands)"
          } else {
            est_formatted = noFormat.to(parseInt(num));
            est_label = ""
          }

          return est_formatted;
        }

        let label = getMagnitude(values[0].value).label;

        year.innerHTML = `<td class = "data-label"><strong>Year:</strong></td>`;
        est.innerHTML = `<td class = "data-label"><strong>Estimate:</strong></td>`;
        change.innerHTML = `<td class = "data-label"><strong>Year-on-Year Change:</strong></td>`;
        moe.innerHTML = `<td class = "data-label"><strong>Margin of Error:</strong></td>`;
        total_change.innerHTML = `<td class = "data-label"><strong>Total Change (from 2010):</strong></td>`;


        // Calculate yearly percent change
        var diffs = [];
        var previousYearVal;
        estimateArray.map(function(yearVal) {
            if(previousYearVal){
              let tot = ( yearVal - previousYearVal );
              let val = ( ( tot / previousYearVal) * 100);
              val = percentFormat.to(val);
              diffs.push({total: tot, percent: val});
            }
            previousYearVal = yearVal;
        });

        diffs.unshift({total: "NA", percent: "NA"})

        let total_diffs = []
        estimateArray.map(yearVal => {
          let tot = ( yearVal - values[0].value );
          let val = (tot / values[0].value) * 100;
          val = percentFormat.to(val);
          total_diffs.push({total: tot, percent: val});
        })


        for(let data of values){
          date = document.createElement('td');
          date.innerHTML = `<strong>${data.year}</strong>`;
          year.appendChild(date);

          estimate = document.createElement('td');
          estimate.innerHTML = getMagnitude(data.value);
          est.appendChild(estimate);

          margin = document.createElement('td');
          margin.innerHTML = `&#177;${getMagnitude(data.moe)} <br> (${percentFormat.to((data.moe/data.value) * 100)})`;
          moe.appendChild(margin);

          pct_chg = document.createElement('td');
          let year_temp = diffs.shift()
          if (year_temp.total != "NA"){
          pct_chg.innerHTML = ` ${getMagnitude(year_temp.total)} <br> (${year_temp.percent})`;
        } else {pct_chg.innerHTML = 'NA'}
          change.appendChild(pct_chg);

          tot_chg = document.createElement('td');
          let total_temp = total_diffs.shift()
          tot_chg.innerHTML = `${getMagnitude(total_temp.total)} <br> (${total_temp.percent})`;
          total_change.appendChild(tot_chg);

          //console.log(total_diffs.shift().percent)

        }




        document.querySelector('#output-data').appendChild(out_df)




        // Define line to be traced with plotly
        let trace = {
          x: years,
          y: estimateArray,
          name: "estimate",
          mode: "lines",
          type: "scatter",
          error_y: {
            type: 'data',
            array: errorArray,
                visible: true
          }
        };

        // Get geographic data from user input
        let stateDisp = document.querySelector('#state-list').options[document.querySelector('#state-list').selectedIndex].innerHTML.replace(/<[^>]*>/g,"");
        let areaDisp = document.querySelector('#area-list').options[document.querySelector('#area-list').selectedIndex].innerHTML.replace(/<[^>]*>/g,"");


        // create title for graph
        let selectedLocation;
        // Use state filter if no urban area specified
        if (areaDisp == "No Filter"| areaDisp == ""){
          selectedLocation = stateDisp;
        } else { selectedLocation = areaDisp; }  // if urban area specified, use that

        // Make the title a little more gramatically correct...
        if (selectedLocation == "United States") {
          selectedLocation = "the " + selectedLocation
        }

        // Define layout, title, ect.
        let layout = {
          title: `Estimated ${data.concept.replace('Sex By Age', 'Population')}: <br> ${data.label.replace("Estimate ","")} in ${selectedLocation}`,
          xaxis: {
            range: [2009.9,2017.1]
          }
        }

        document.querySelector('.loader').style.display = "none";  // hide laoder

        Plotly.newPlot('chart', [trace], layout, {responsive: true}) // draw the plot

        try {
            document.querySelector('.plot-container').style.opacity = '1'; // show the plot
        } catch (e) { }


        /* Uncomment for continuous error bars

        let dataArray = [
            {data: combined.acs2010.value, error: combined.acs2010.error},
            {data: combined.acs2011.value, error: combined.acs2011.error},
            {data: combined.acs2012.value, error: combined.acs2012.error},
            {data: combined.acs2013.value, error: combined.acs2013.error},
            {data: combined.acs2014.value, error: combined.acs2014.error},
            {data: combined.acs2015.value, error: combined.acs2015.error},
            {data: combined.acs2016.value, error: combined.acs2016.error},
            {data: combined.acs2017.value, error: combined.acs2017.error}
        ]

        let errorArray = dataArray.map(x => {
          return x.error
        })

        let moe_plus = dataArray.map(x => {
          let moe = parseInt(x.error);
          let est = parseInt(x.data);
          if (moe < 0){
            return est;
          } else {
            return est + moe;
          }
        })

        let moe_minus = dataArray.map(x => {
          let moe = parseInt(x.error);
          let est = parseInt(x.data);
          if (moe < 0){
            return est;
          } else {
            return est-moe;
          }
        })

        let errorArr = moe_plus.concat(moe_minus.reverse());

        dataArr = dataArray.map(x => {
          let int = parseInt(x.data);
          return int;
        })

        let moe_text = errorArray.concat(errorArray.reverse())

        moe_text = moe_text.map(x => {
          let val = x / 1000
          return '&#177;' + val + 'K' ;
        })

        var moe = {
          x: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010],
          y: errorArr,
          fill: "tozerox",
          fillcolor: "rgba(0,176,246,0.2)",
          line: {color: "transparent"},
          name: "MOE",
          showlegend: false,
          type: "scatter",
          text: moe_text,
          hoverinfo: "text+name"
        };

        let trace ={x: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
                    y: dataArr,
                    line: {color: "rgb(0,176,246)"},
                    mode: "lines",
                    showlegend: false,
                    type: "scatter",
                    name: "estimate",
                    hoverinfo: "y+name"
                  };

        let stateDisp = document.querySelector('#state-list').options[document.querySelector('#state-list').selectedIndex].innerHTML.replace(/<[^>]*>/g,"");
        let areaDisp = document.querySelector('#area-list').options[document.querySelector('#area-list').selectedIndex].innerHTML.replace(/<[^>]*>/g,"");

        let selectedLocation;


        if (areaDisp == "No Filter"| areaDisp == ""){
          selectedLocation = stateDisp;
        } else {
          selectedLocation = areaDisp;
        }

        if (selectedLocation == "United States") {
          selectedLocation = "The " + selectedLocation
        }

        let layout = {
          title: `${data.label.replace("Estimate ","")} in ${selectedLocation}`,
          xaxis: {
            range: [2010,2017]
          }
        }



        Plotly.newPlot('chart', [trace, moe], layout, {responsive: true})

        */


      }).catch(error => {
        // get user input from filters
        let stateDisp = document.querySelector('#state-list').options[document.querySelector('#state-list').selectedIndex].innerHTML.replace(/<[^>]*>/g,"");
        let areaDisp = document.querySelector('#area-list').options[document.querySelector('#area-list').selectedIndex].innerHTML.replace(/<[^>]*>/g,"");

        let selectedLocation;


        if (areaDisp == "No Filter"| areaDisp == ""){
          selectedLocation = stateDisp;
        } else {
          selectedLocation = areaDisp;
        }

          console.log(error.message)

          // create informative error message
          document.querySelector('#api-error').innerHTML =
            `Sorry, <em>"${data.label}"</em> for <em>${selectedLocation}</em> didn't load correctly.` +
            ` Please try again. <br>`;
          document.querySelector('#api-error').style.display = "";  // show error bar
          document.querySelector('#reload').style.display = "";     // show reload button
          document.querySelector('.loader').style.display = "none"; // hide loading icon
        });

   }

    $('#table tbody').on('click', 'tr', getData);
    $('#state-list').change(updateUrbanAreas)
    $('#state-list').change(drawGraph)
    $('#area-list').change(drawGraph)
    $('#reload').click(drawGraph)
});

// Census API call
// https://api.census.gov/data/2013/acs1?get=NAME,B02015_009E,B02015_009M&for=state:*&key=a769fc5759255ab9b72ff689b5de8c250249a7be
