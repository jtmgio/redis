"use strict"
//imports
const redis = require( "redis" );
const bluebird = require( "bluebird" );
const Log = require( "@jtmgio/mc-logger" );
const _ = require( "lodash" );
//promisfy the redis library
bluebird.promisifyAll( redis.RedisClient.prototype );
bluebird.promisifyAll( redis.Multi.prototype );

//module vars
let cl = null;
let redis_server_key = null;
let redis_server_name = null;
let redis_client = null;
let required_args_length = 5;
//expiration is 7 days
let expiration = 86400 * 7;

//public API
module.exports = {
	init : init,
	createRedisClient : createRedisClient,
	set : set,
	get : get,
	setRedisKey : setRedisKey,
	getRedisKey : getRedisKey,
	exists : exists,
	close : () => {} //empty wrapper
};

/**
* init
* @param string env
* @param string path
* @param string module_name
* @param string log_entries_key
* @param string redis_server
* @return 
*/
function init( env, path, module_name, log_entries_key, redis_server ){
	if( !paramsValid( arguments ) ){
		throw new Error( "All parameters are required to use this library: env, path, module_name, log_entries_key, redis_server" );
		return;
	}
	//set global vars
	redis_server_name = redis_server;
	cl = new Log({
		path : path
	});	
}
/**
* createRedisClient
* @return void
*/
function createRedisClient(){
	if( _.has( redis_client, "connected" ) && redis_client.connected ){
		return;
	}	
	cl( "-".repeat( 100 ) );
	cl( "Starting Redis Connection" );
	redis_client = redis.createClient({
		host : redis_server_name
	});
	redis_client.on( "ready", ret => {
		cl( "Redis is ready" );
		return true;
	});
	redis_client.on( "connect", ret => {
		cl( "Redis is connecting" );
		return true;
	});
	redis_client.on( "error", err => {
		cl({ log_level : "critical", message : "Redis communication error" });
		cl({ log_level : "critical", message : JSON.stringify( err ) });
	});
	cl( "-".repeat( 100 ) );
	return;

}
/**
* validateParams
* @param args
* @return boolean	
*/
function paramsValid( args ){
	return ( args.length === required_args_length );
}
/**
* setRedisData
* @param redis_key
* @param data
* @return void
*/
function set( redis_key, data ){
	cl( `setting redis data for key: ${ redis_key }` );
	cl( `setting the following data: ${ data }` );
	redis_client.set( redis_key, data, function( err, response ){
		if( !_.isNull( err ) ){
			cl({ log_level : "critical", message : err });
		}
	});
	return;
}
/**
* getRedisData
* @param redis_key
* @param 
* @return string		
*/
function get( redis_key ){
	return redis_client.getAsync( redis_key );
}
/**
* setRedisKey
* @param string appName
* @param string route
* @param int serviceId
* @param int userId
* @return string
*/
function setRedisKey( appName, sericeId, route, userId ){
	redis_server_key = "app:" + Array.prototype.join.call( arguments, ":" );
}
/**
* getRedisKey
* @param string appName
* @param string route
* @param int serviceId
* @param int userId
* @return string
*/
function getRedisKey( appName, sericeId, route, userId ){
	return "app:" + Array.prototype.join.call( arguments, ":" );
}
/**
* exists
* @param key
* @return boolean
*/
function exists( key ){
	return new Promise( ( resolve, reject ) =>{
		redis_client.keys( key, ( err, reply ) =>{
			if( err ){
				reject( err );
			}else{
				resolve( reply.length ? true : false );
			}
		});
	});
}