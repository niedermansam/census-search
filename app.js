let display = acs2016;
var userData = [];
let data;


var Format = wNumb({
  mark: '.',
  decimals: 0,
	thousand: ','
});


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

      let arr=[];
      document.querySelector('#api-error').style.display = "none";
      document.querySelector('#reload').style.display = "none";

      selectedState = document.querySelector('#state-list').value;
      selectedArea = document.querySelector('#area-list').value;

      if(selectedState != 'us'){
        selectedState = "&for=state:" + selectedState;
      } else {
          selectedState = "&for=" + selectedState;
      }

      if(selectedArea != ""){
        selectedState = "&in=state:" + selectedArea.match(/^../)
        selectedArea = "&for=place:" + selectedArea.match(/.....$/)
      }


       for(let i = 2010;i <= 2017;i++) {
         url = `https://api.census.gov/data/${i}/acs/acs1?` +
                `get=NAME,${getVar}E,${getVar}M${selectedArea}${selectedState}&` +
                `key=6bf6ebcdeb96c3c930719fbcd5c1a08d713eea35` //&for=state:*
         arr.push({url: url, year: i});

      }

      let acs2010 =
        fetch(arr[0].url)
          .then(resp =>resp.json())
          .then(resp => resp[1]);

      let acs2011 =
        fetch(arr[1].url)
          .then(resp =>resp.json())
          .then(resp => resp[1]);

      let acs2012 =
        fetch(arr[2].url)
          .then(resp =>resp.json())
          .then(resp => resp[1]);

      let acs2013 =
        fetch(arr[3].url)
          .then(resp =>resp.json())
          .then(resp => resp[1]);

      let acs2014 =
          fetch(arr[4].url)
            .then(resp =>resp.json())
            .then(resp => resp[1]);

      let acs2015 =
          fetch(arr[5].url)
            .then(resp =>resp.json())
            .then(resp => resp[1]);

      let acs2016 =
          fetch(arr[6].url)
            .then(resp =>resp.json())
            .then(resp => resp[1]);

      let acs2017 =
          fetch(arr[7].url)
            .then(resp =>resp.json())
            .then(resp => resp[1]);



      let combined = { "acs2010":{}, "acs2011":{}, "acs2012":{}, "acs2013":{},  "acs2014":{}, "acs2015":{}, "acs2016":{}, "acs2017":{}};

      Promise.all([ acs2010, acs2011, acs2012, acs2013, acs2014, acs2015, acs2016, acs2017]).then(values => {
        combined["acs2010"] = values[0];
        combined["acs2011"] = values[1];
        combined["acs2012"] = values[2];
        combined["acs2013"] = values[3];
        combined["acs2014"] = values[4];
        combined["acs2015"] = values[5];
        combined["acs2016"] = values[6];
        combined["acs2017"] = values[7];

        return combined
      }).then(combined => {


        let errorArray = [
            combined.acs2010[2],
            combined.acs2011[2],
            combined.acs2012[2],
            combined.acs2013[2],
            combined.acs2014[2],
            combined.acs2015[2],
            combined.acs2016[2],
            combined.acs2017[2]];

        errorArray = errorArray.map(x => {
          let int = parseInt(x)
          if (int < 0){
            return 0;
          } else {
            return x;
          }
        })
        console.log(errorArray)
        let trace = {
          x: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
          y: [combined.acs2010[1],
              combined.acs2011[1],
              combined.acs2012[1],
              combined.acs2013[1],
              combined.acs2014[1],
              combined.acs2015[1],
              combined.acs2016[1],
              combined.acs2017[1]],
          name: "estimate",
          mode: "lines",
          type: "scatter",
          error_y: {
            type: 'data',
            array: errorArray,
                visible: true
          }
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
          selectedLocation = "the " + selectedLocation
        }

        let layout = {
          title: `Estimated ${data.concept.replace('Sex By Age', 'Population')}: <br> ${data.label.replace("Estimate ","")} in ${selectedLocation}`,
          xaxis: {
            range: [2009.9,2017.1]
          }
        }

        document.querySelector('.loader').style.display = "none";

        Plotly.newPlot('chart', [trace], layout, {responsive: true})

        try {
            document.querySelector('.plot-container').style.opacity = '1';
        } catch (e) {

        }


        /* Uncomment for continuous error bars

        let dataArray = [
            {data: combined.acs2010[1], error: combined.acs2010[2]},
            {data: combined.acs2011[1], error: combined.acs2011[2]},
            {data: combined.acs2012[1], error: combined.acs2012[2]},
            {data: combined.acs2013[1], error: combined.acs2013[2]},
            {data: combined.acs2014[1], error: combined.acs2014[2]},
            {data: combined.acs2015[1], error: combined.acs2015[2]},
            {data: combined.acs2016[1], error: combined.acs2016[2]},
            {data: combined.acs2017[1], error: combined.acs2017[2]}
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
        let stateDisp = document.querySelector('#state-list').options[document.querySelector('#state-list').selectedIndex].innerHTML.replace(/<[^>]*>/g,"");
        let areaDisp = document.querySelector('#area-list').options[document.querySelector('#area-list').selectedIndex].innerHTML.replace(/<[^>]*>/g,"");

        let selectedLocation;


        if (areaDisp == "No Filter"| areaDisp == ""){
          selectedLocation = stateDisp;
        } else {
          selectedLocation = areaDisp;
        }

          console.log(error.message)
          document.querySelector('#api-error').innerHTML =
            `Sorry, <em>"${data.label}"</em> for <em>${selectedLocation}</em> didn't load correctly.` +
            ` Please try again. <br>`;
          document.querySelector('#api-error').style.display = "";
          document.querySelector('#reload').style.display = "";
          document.querySelector('.loader').style.display = "none";
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
