pagerun.on('beforeEnd', function(){
    var oldJscoverage = window._$jscoverage;
    var newJscoverage = {};
    var oldData;
    for(var file in oldJscoverage){
        oldData = oldJscoverage[file];
        newJscoverage[file] = {
            lineData: getLineObject(oldData.lineData),
            functionData: getFunctionObject(oldData.functionData),
            branchData: getBranchObject(oldData.branchData),
        };
    }
    pagerun.info('jscoverage', newJscoverage);
    function getLineObject(lineData){
        var objData = {};
        var count;
        for(var i=0,c=lineData.length;i<c;i++){
            count = lineData[i];
            if(count !== undefined && count !== null){
                objData[i] = count;
            }
        }
        return objData;
    }
    function getFunctionObject(functionData){
        var arrIndex = functionData.index;
        var objData = {};
        var count;
        var indexInfo;
        for(var i=0,c=functionData.length;i<c;i++){
            count = functionData[i];
            if(count !== undefined && count !== null){
                indexInfo = arrIndex[i];
                objData[i] = {
                    name: indexInfo[0],
                    line: indexInfo[1],
                    col: indexInfo[2],
                    count: count
                };
            }
        }
        return objData;
    }
    function getBranchObject(branchData){
        var oldArrLines;
        var newBranchData = {};
        var count = 0;
        for (var line in branchData){
            oldArrLines = branchData[line];
            for(var i=1,c=oldArrLines.length;i<c;i++){
                oldBranchObject = oldArrLines[i];
                if(oldBranchObject !== undefined && oldBranchObject !== null){
                    newBranchData[count++] = {
                        evalFalse: oldBranchObject.evalFalse,
                        evalTrue: oldBranchObject.evalTrue,
                        nodeLength: oldBranchObject.nodeLength,
                        line: parseInt(line,10),
                        position: oldBranchObject.position,
                        src: oldBranchObject.src,
                        message: oldBranchObject.message()
                    };
                }
            }
        }
        return newBranchData;
    }
});