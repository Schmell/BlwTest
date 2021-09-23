const Csv = {

    /**
     * 
     */
    fromInput: function(e){
        let file = e.target.files[0];
        let last = JSON.parse(localStorage.getItem('using'));
        if(!last){
            LL('no last');
            last = {};
            last.name = 'nofile';
            last.lastModified = Date.now();
        }localStorage
        if(file.name != last.name || file.lastModified != last.lastModified && last){
            console.log('File has been changed, using new file');
            //TODO: backup old files text to a new file
            let oldFile = localStorage.getItem('currentFile');
            let notUsing = localStorage.getItem('using');
            localStorage.setItem('oldFile',oldFile);
            //does not work as you cannot iterate File obj.
            //not too sure if i need this anyway
            localStorage.setItem('notUsing',notUsing);
            localStorage.removeItem('currentFile');
            localStorage.removeItem('using');
            Papa.parse(file, {
                complete: function(results) {
                    let unParsed = Papa.unparse(results.data);
                    //console.log(file);
                    let fileArr = { "name":file.name, "lastModified":file.lastModified, "lastModifiedDate":file.lastModifiedDate,"size":file.size }
                    localStorage.setItem('using',JSON.stringify(fileArr));
                    localStorage.setItem('currentFile', unParsed);
                }
            });
        }else{
            console.log('File not changed, using file from storage');
            console.log('using:', JSON.parse(localStorage.getItem('using')));
        }
    }, //fromInput

    /**
     * 
     */
    getComps: function(){
    let file = localStorage.getItem('currentFile');
    let parsed = Papa.parse(file);
    let data = parsed.data;
    
    var compData = [];
    var compBoats = data.filter(function(item){return item[0] == 'compboat';});
    var sortedBoats = compBoats.sort();
    sortedBoats.forEach(function(compBoat){
        let competitor = {};
        competitor.id = parseInt(compBoat[2]);
        competitor.compId = compBoat[2];
            let compRows = data.filter(function(item){
                var regex = new RegExp(`^comp`, "g");
                return item[0].match(regex)&&item[2]==compBoat[2];
            })
        compRows.forEach(function(item){competitor[item[0]] = item[1]});
        compData.push(competitor);
    });//each compBoats   
    var sorted = compData.sort(function(a,b){return a.boat - b.boat});
    //console.log(compData)
    return compData; 
    }, // getComps

    /** RESULT ROWS 
     *   This is the result rows from blw file
     *   "rft","19:37:23","26","106"
     *   "rst","18:40:00","26","106"
     *   "rpts","5","26","106"
     *   "rpos","5","26","106"
     *   "rdisc","0","26","106"
     *   "rcor","0:57:05","26","106"
     *   "rrestyp","4","26","106"
     *   "rele","0:57:23","26","106"
     *   "srat","0","26","106"
     *   "rewin","0:06:21","26","106"
     *   "rrwin","238.841","26","106"
     *   "rrset","0","26","106"   
     */
    getResults: function(){
        let file = localStorage.getItem('currentFile');
        let parsed = Papa.parse(file);
        let data = parsed.data;
        let resultsArr = [];
        let results = data.filter(function(item){return item[0] == "rft"});
        // LL('results', results)
        results.forEach(function(result){
            let resultRow = {
                compId: result[2],
                raceId: result[3],
                finish: Csv.resultHelp('rft',data,result),
                start: Csv.resultHelp("rst",data,result),
                points: Csv.resultHelp("rpts",data,result),
                position: Csv.resultHelp("rpos",data,result),
                discard: Csv.resultHelp("rdisc",data,result),
                corrected: Csv.resultHelp("rcor",data,result),
                rrestyp: Csv.resultHelp("rrestyp",data,result),
                elapsed: Csv.resultHelp("rele",data,result),
                srat: Csv.resultHelp("srat",data,result),
                rewin: Csv.resultHelp("rewin",data,result),
                rrwin: Csv.resultHelp("rrwin",data,result),
                rrset: Csv.resultHelp("rrset",data,result)
            }
            resultsArr.push(resultRow);
        });// forEach
        //console.log(resultsArr);
        return resultsArr;
    }, // getResults

    resultHelp: function(resultTag,data,result){
        let res = data.filter(function(item){return item[0] == resultTag && item[2] == result[2] && item[3] == result[3] });
        return res[0][1];
    }, // resultsHelp

    getFleets: function(){
        let file = localStorage.getItem('currentFile');
        let parsed = Papa.parse(file);
        let data = parsed.data;
        var fleetsRaw = data.filter(function(item){return item[0] == 'serpubgroupvalues'});
        var fleets = fleetsRaw[0][1].match(/[^|]+/g);
        //console.log(fleets);
        return fleets;
    }, // getFleets

    getRaces: function(){
        let file = localStorage.getItem('currentFile');
        let parsed = Papa.parse(file);
        let data = parsed.data;
        var raceData = [];
        //races =[0-racename,1-NAME,2-space,3-ID]
        var races = data.filter(function(item){return item[0] == 'racename';});
        races.forEach(function(race){
            //console.log('race',race)
            var raceObj = {};
            raceObj.id = parseInt(race[3]);
            raceObj.raceId = race[3];
            let resultRows = data.filter(function(item){
                var regex = new RegExp(`^race`, "g");
                return item[0].match(regex)&&item[3]==race[3];
            })
            resultRows.forEach(function(item){
                raceObj[item[0]] = item[1];
            })
            raceData.push(raceObj);
        });
        //console.log(raceData);
        return raceData;
    }, // getRaces

    getSeries: function(){
        let file = localStorage.getItem('currentFile');
        let parsed = Papa.parse(file);
        let data = parsed.data;
        var seriesData = [];
        let seriesRows = data.filter(function(item){
            var regex = new RegExp(`^ser`, "g")
            return item[0].match(regex);
        });
        seriesObj = {};
        seriesRows.forEach(item=>{
            seriesObj[item[0]] = item[1];
        });
        seriesData.push(seriesObj);
        //console.log(seriesData);
        return seriesData;
    } // getSeries

} // Csv namespace