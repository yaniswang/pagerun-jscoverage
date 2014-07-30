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
    var summary = getSummary(newJscoverage);
    pagerun.info('jscoverage', {
        url: location.href,
        summary: summary,
        data: newJscoverage
    });
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
    function getSummary(coverData){
        var statData = {};
        var fileData;
        // line var
        var lineData;
        var lineCount, coveredLineCount;
        var allLineCount = 0, allCoveredLineCount = 0;
        var coveredLineRatioSum = 0, haveLineFileCount = 0;
        // func var
        var functionData;
        var funcCount, coveredFuncCount;
        var allFuncCount = 0, allCoveredFuncCount = 0;
        var coveredFuncRatioSum = 0, haveFuncFileCount = 0;
        // branch var
        var branchData;
        var branchCount, coveredBranchCount;
        var allBranchCount = 0, allCoveredBranchCount = 0;
        var coveredBranchRatioSum = 0, haveBranchFileCount = 0;
        for(var file in coverData){
            fileData = coverData[file];
            // stat line
            lineData = fileData.lineData;
            lineCount = 0;
            coveredLineCount = 0;
            for(var line in lineData){
                lineCount ++;
                allLineCount ++;
                if(lineData[line] > 0){
                    coveredLineCount ++;
                    allCoveredLineCount ++;
                }
            }
            fileData.lineCount = lineCount;
            if(lineCount > 0){
                haveLineFileCount ++;
                fileData.coveredLineCount = coveredLineCount;
                fileData.coveredLineRatio = getFixedRatio(coveredLineCount / lineCount);
                coveredLineRatioSum += fileData.coveredLineRatio;
            }
            // stat func
            functionData = fileData.functionData;
            funcCount = 0;
            coveredFuncCount = 0;
            for(var id in functionData){
                funcCount ++;
                allFuncCount ++;
                if(functionData[id].count > 0){
                    coveredFuncCount ++;
                    allCoveredFuncCount ++;
                }
            }
            fileData.funcCount = funcCount;
            if(funcCount > 0){
                haveFuncFileCount ++;
                fileData.coveredFuncCount = coveredFuncCount;
                fileData.coveredFuncRatio = getFixedRatio(coveredFuncCount / funcCount);
                coveredFuncRatioSum += fileData.coveredFuncRatio;
            }
            // stat branch
            branchData = fileData.branchData;
            branchCount = 0;
            coveredBranchCount = 0;
            for(var id in branchData){
                branchCount +=2;
                allBranchCount +=2;
                if(branchData[id].evalFalse > 0){
                    coveredBranchCount ++;
                    allCoveredBranchCount ++;
                }
                if(branchData[id].evalTrue > 0){
                    coveredBranchCount ++;
                    allCoveredBranchCount ++;
                }
            }
            fileData.branchCount = branchCount;
            if(branchCount > 0){
                haveBranchFileCount ++;
                fileData.coveredBranchCount = coveredBranchCount;
                fileData.coveredBranchRatio = getFixedRatio(coveredBranchCount / branchCount);
                coveredBranchRatioSum += fileData.coveredBranchRatio;
            }
        }
        statData.haveLineFileCount = haveLineFileCount;
        statData.allLineCount = allLineCount;
        statData.allCoveredLineCount = allCoveredLineCount;
        statData.allCoveredLineRatio = getFixedRatio(allCoveredLineCount / allLineCount);
        statData.averageCoveredLineRatio = getFixedRatio(coveredLineRatioSum / haveLineFileCount);

        statData.haveFuncFileCount = haveFuncFileCount;
        statData.allFuncCount = allFuncCount;
        statData.allCoveredFuncCount = allCoveredFuncCount;
        statData.allCoveredFuncRatio = getFixedRatio(allCoveredFuncCount / allFuncCount);
        statData.averageCoveredFuncRatio = getFixedRatio(coveredFuncRatioSum / haveFuncFileCount);

        statData.haveBranchFileCount = haveBranchFileCount;
        statData.allBranchCount = allBranchCount;
        statData.allCoveredBranchCount = allCoveredBranchCount;
        statData.allCoveredBranchRatio = getFixedRatio(allCoveredBranchCount / allBranchCount);
        statData.averageCoveredBranchRatio = getFixedRatio(coveredBranchRatioSum / haveBranchFileCount);
        return statData;
    }
    function getFixedRatio(num){
        return Math.round(num*1000)/1000;
    }
});