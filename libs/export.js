const moment = require('moment')
const path = require('path');
const _async = require('async');
const _Excel = require('exceljs');
const fsx =  require('fs.extra');

exports.exportExcel = (ok, excel, res, req) => {
    try {
        return exportExcel(ok, excel, req, res);
    } catch (error) {
        return resp.throws(res, req, error)
    }
}

function exportExcel(dataMap, excel, req, res){
    let titleHeadTable = [];
    excel.titleHeadTable.forEach(item => {
        item.value = item.value.toUpperCase();
        titleHeadTable.push(item);
    })
    /* do dai cac cot trong excel */
    let valueWidthColumn = excel.valueWidthColumn
    var waterFallTask = [];

    waterFallTask.push(function (next) {
        var workbook = new _Excel.Workbook();
        workbook.creator = req.user ? req.user.displayName: 'ICT - HN';
        workbook.created = new Date();
        next(null, workbook)
    });


    waterFallTask.push(function (workbook, next) {
        var sheet = workbook.addWorksheet('sheet', { state: 'visible' });
        setWeightColumn(sheet, valueWidthColumn);
    //    creatTitleExcel(sheet, 
    //         excel.title,
    //         req.query.startTime || '',
    //         req.query.endTime || '',
    //         `ICT-HN`
    //     );
        createHead(sheet, titleHeadTable);

        if(dataMap.length <= 0){
            let _value = [];
            //1 dong mac dinh tranh truong hop file loi khi ko co data
            sheet.addRow(_value);
        }else{
            _.each(dataMap, function (item, index) {    
                let _value = []
                titleHeadTable.forEach(el => {
                    _value.push((item[el.key] || item[el.key] == 0) ? item[el.key] : '')
                });

                sheet.addRow(_value);
    
                sheet.lastRow.font = { family: 4, name: 'Time New Roman', size: 11 };
                sheet.lastRow.alignment = { vertical: 'middle', horizontal: 'center' };
                sheet.lastRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                for (var i = 1; i <= titleHeadTable.length; i++) {
                    let charNameColumn = columnToLetter(i);
                    sheet.lastRow.getCell(charNameColumn).border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" }
                    }
                }
            })
        }

        next(null, workbook);
    });


    waterFallTask.push(
        function (workbook, next) {
            fsx.mkdirs(path.join('uploads', 'report'), function (error, result) {
                next(error, workbook);
            });
        },
        function (workbook, next) {
            var fileName = path.join('uploads', 'report', excel.fileName + moment().format("YYYY-MM-DD HH-mm") + '.xlsx');
            workbook.xlsx.writeFile(fileName).then(function (error, result) {
                next(error, path.join('uploads', 'report', excel.fileName + moment().format("YYYY-MM-DD HH-mm") + '.xlsx'));
            });
        }
    );

    _async.waterfall(waterFallTask, function (error, result) {
        if(error){
            resp.throws(res, req, error)
        }else{
            res.download(result)
        }
    });
}

/**
 * set do dai cot trong file excel 
 * @param {*} worksheet 
 */
function setWeightColumn(worksheet, valueWidthColumn) {
	_.each(valueWidthColumn, function (item, index) {
		worksheet.getColumn(++index).width = item;
	})
}

// function creatTitleExcel(worksheet, titleReport, from, to, account) {
//     worksheet.addRow(['']);
// 	worksheet.addRow(['BELLSYSTEM 24 VIETNAM','','','CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM']);
// 	worksheet.lastRow.alignment = { vertical: 'middle', horizontal: 'center' };
// 	worksheet.lastRow.font = { family: 4, name: 'Time New Roman', size: 13, bold: true};
// 	worksheet.mergeCells('A2:C2');
// 	worksheet.mergeCells('D2:H2');

// 	worksheet.addRow([account || 'ICT - HN', '','','Độc lập - Tự do - Hạnh phúc']);
// 	worksheet.lastRow.alignment = { vertical: 'middle', horizontal: 'center'};
// 	worksheet.lastRow.font = { family: 4, name: 'Time New Roman', size: 13, bold: true }
// 	worksheet.mergeCells('A3:C3');
// 	worksheet.mergeCells('D3:H3');

// 	worksheet.addRow(['']);
// 	worksheet.addRow(['']);

// 	worksheet.addRow([titleReport]);
// 	worksheet.lastRow.alignment = { vertical: 'middle', horizontal: 'center' };
// 	worksheet.lastRow.font = {name:'Time New Roman', family: 4, size: 18, underline: 'true', bold:true};
// 	worksheet.mergeCells('A6:H6');
//     const column6 = worksheet.getRow(6);
//     column6.height = 30;

//     let str = '(Thời gian từ ngày: ';
//     str += (from ? (from + " ") : "... ");
// 	str += (to ? ("đến ngày " + to + ")") : "đến ngày ... )");
// 	worksheet.addRow([str]);
// 	worksheet.lastRow.font = { family: 4, name: 'Time New Roman', size: 13};
// 	worksheet.lastRow.alignment = { vertical: 'middle', horizontal: 'center' };
// 	worksheet.mergeCells('A7:H7');
// 	worksheet.addRow([""]);
// }

function createHead(worksheet, titleHeadTable) {
	//Header 01
	worksheet.addRow(_.pluck(titleHeadTable, 'value'));

	worksheet.lastRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
	worksheet.lastRow.font = { family: 4, name: 'Times New Roman', size: 12, bold: true, color: {argb: 'FFFFFF'} };
	worksheet.lastRow.height = 30;

	for (var i = 1; i <= titleHeadTable.length; i++) {
		let charNameColumn = columnToLetter(i);
        const cell = worksheet.lastRow.getCell(charNameColumn)
        cell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" }
		}
        cell.fill  = {type: 'pattern', pattern: 'solid', fgColor: { argb: '346D92' }};
	}
}

function columnToLetter(column) {
    var temp, letter = '';
    while (column > 0) {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
}