var cron = require('node-cron');
const xlsx = require('node-xlsx').default;
const fs = require('fs');

const jobImportExcel = async () => {
    try {
        cron.schedule('*/30 * * * * *', async function () {
            console.log('************ Start Job Import  ************');
            let check = await _Jobs.findOne({ job_status: 'running' }).lean();
            if (!check) {
                let job = await _Jobs.findOne({ job_status: 'pending' }).lean();
                if (job) {
                    await _Jobs.findByIdAndUpdate(job._id, {job_status : 'running'});
                    return importFile(job);
                }
            }
        })
    } catch (error) {
        console.log('loi import', error.message || error);
    }
}

function importFile(job) {
    let data = null;
    try {
        data = xlsx.parse(_rootPath.replace(/\\/g, '/') + job.file);
        console.log(_rootPath.replace(/\\/g, '/') + job.file);
    }  catch (ex) {
        return _Jobs.findByIdAndUpdate(job._id, {job_status : 'stop'}).then(fuck => {
            console.log('done by file not found');
            return;
        });
    }
    let list = data ? data[0].data : [];
    list = list.reduce((memo, el, index)=>{
        for(let i = 0; i < el.length; i++){
            if(el[i] != '' && el[i] != undefined && el[i] != null){
                memo.push(el);
                break;
            }
        }
        return memo;
    }, []);
    fieldsName = {
        'name': 'Tên',
        'price': 'Giá',
        'quantity': 'Số lượng',
    };
    dataExcel = {
        'name': '0',
        'price': '1',
        'quantity': '2'
    }
    let payloads = [];
    let fileExcel = [];
    let arr = [];
    // add header excel
    Object.keys(dataExcel).forEach(key => {
        arr.push(fieldsName[key])
    })
    arr = arr.concat(["Status", "Reason"]);
    fileExcel.push(arr);
    // check data valid
    let i = 0;
    list.forEach(e => {
        let isImport = true;
        if (i == 0) {
            isImport = false;
            i++;
        }
        if (isImport) {
            let payload = {};
            let dataPayloadExcel = []
            Object.keys(dataExcel).forEach(key => {
                if (dataExcel.hasOwnProperty(key) && e.length > parseFloat(dataExcel[key])) {
                    payload[key] = e[parseFloat(dataExcel[key])];
                    dataPayloadExcel.push
                }
            });
            Object.keys(dataExcel).forEach(key => {
                dataPayloadExcel.push(payload[key])
            })
            if(!payload['name']) {
                isImport = false;
                dataPayloadExcel.push('Failed', 'Tên không hợp lệ!');
            }
            else if(isImport && (!payload['price'] || isNaN(payload['price']))) {
                isImport = false;
                dataPayloadExcel.push('Failed', 'Giá không hợp lệ!');
            }
            else if(isImport && (!payload['quantity'] || isNaN(payload['quantity']))) {
                isImport = false;
                dataPayloadExcel.push('Failed', 'Số lượng không hợp lệ!');
            }
            else {
                // check other
            }
            if(isImport) {
                payloads.push(payload);
                dataPayloadExcel.push("Success!", "")
            }
            fileExcel.push(dataPayloadExcel);
        }
    })
    // import database
    return execDatabase(job, payloads, fileExcel);
}

async function execDatabase(job, payloads, fileExcel) {
    try {
        let filePath = writeXlsx(fileExcel);
        // for (let data of payloads) {
        //     let obj = {
        //         image: '',
        //         name: data.name,
        //         price: data.price,
        //         quantity: data.quantity,
        //         date: new Date()
        //     }
        //     await _Products.create(obj);
        // }
        return _Jobs.findByIdAndUpdate(job._id, {job_status : 'stop', file_out: filePath, updatedAt: new Date()}).then(res => {
            console.log('--- done import ---');
            return;
        });
    } catch (error) {
        return _Jobs.findByIdAndUpdate(job._id, {job_status : 'stop', updatedAt: new Date()}).then(res => {
            console.log('done by error -----', error.message || error);
            return;
        });
    }
}
function writeXlsx(data){
    var xlsx_wb = xlsx.build([{name: "Sheet1", data: data}]);
    let path = _rootPath.replace(/\\/g, '/');
    var file_path = "./public/exports/" + "BaoCaoKetQuaImport_" + moment().format("YYYY-MM-DD HH-mm") + ".xlsx";
    var fileName = "BaoCaoKetQuaImport_" + moment().format("YYYY-MM-DD HH-mm") + ".xlsx";
    fs.writeFileSync(file_path, xlsx_wb, "binary", function(err){
        if(err) {
            console.log(err);
        } else {
            console.log("The file was saved!");
        }
    });
    return fileName;
}

module.exports = {
    jobImportExcel
};