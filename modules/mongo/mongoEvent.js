var mongoose = require('./mongoose');
var mongoosePaginate = require('mongoose-paginate');
var json2csv = require('json2csv');

var Schema = mongoose.Schema;

let eventSchema = new Schema({
    macAddr    : {  type: String, required: true},
    data       : {  type: String, required: true},
    recv       : {  type: String, required: true},
    date       : {  type: String, required: true},
    timestamp  : {  type: Number, required: true},
    //extra      : { type: Schema.Types.Mixed, required: true},
    information: { type: Schema.Types.Mixed, required: true},
});
eventSchema.plugin(mongoosePaginate);

var EventModel = mongoose.model('Event', eventSchema);

module.exports = {
    create,
    findLast,
    find,
    getAverage
}

function create (obj) {
    var newEvent = new EventModel({
        macAddr     : obj.macAddr,
        data        : obj.data,
        recv        : obj.recv,
        date        : obj.date,
        timestamp   : obj.timestamp,
        extra       : obj.extra,
        information : obj.information
    });
    return new Promise(function (resolve, reject) {
        newEvent.save(function(err, docs){
            if(!err){
                // console.log(now + ' Debug : Device save fail!');
                resolve(docs);
            }else{
                console.log(new Date() + 'Create message fail : ' + err.message);
                reject(err);
            }
        });
    });
}

function findLast (json) {
    return new Promise(function (resolve, reject) {
        EventModel.find(json).sort({recv: -1}).limit(1).exec(function(err,docs){
            if(err){
                reject(err);
            }else{
                var doc = null;
                if (docs && docs.length > 0) {
                    doc = docs[0];
                }
                resolve(doc);
            }
        });
    });
}

function find(json, _paginate, _offset, _limit,_sort) {
    var sort = {recv: -1};
    if(_sort === 'asc') {
        sort = {recv: 1};
    }
    return new Promise(function (resolve, reject) {
        if (_paginate === false) {
            
            EventModel.find(json).sort(sort).limit(_limit).exec(function(err,result){
                if(err){
                    reject(err)
                }else{
                    resolve(result);
                }
            });
        } else { 
            
            var options = {   
                    sort: sort,
                    offset: _offset,
                    limit: _limit
                };
            EventModel.paginate(json, options, function(err, result) {
                if(err){
                    reject(err)
                }else{
                    resolve(result);
                }
            });
        }
    });
}


function getAverage() {
    
    return new Promise(function (resolve, reject) {
        
            var year = 2022 ;
            EventModel.aggregate({
                // $match: { instance_id: { $gte: 21 }}
                $match : {
                    year:year
                }
            }).group({
                _id: { 
                    macAddr:"$macAddr",
                    month: 
                    {
                        $month:  {
                            $dateFromString: {
                                dateString: '$date'
                            }
                        }
                    },
                 },
                 
                temperature: { $avg: "$information.temperature" },
                o2: { $avg: "$information.o2" },
                nh: { $avg: "$information.nh" },
                ec: { $avg: "$information.ec" },
                ph: { $avg: "$information.ph" },
            }, { cursor:{}}
            ).exec(function(err, result) {
                if(err){
                    console.log(err);
                    reject(err)
                }else{
                    console.log(result);
                    resolve(result);
                }
            });
        
    });
}


