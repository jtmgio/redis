const redis = require( "./index" );
const Log = require( "@jtmgio/mc-logger" );

redis.init( "dev", "/", "test-module", "1234", "dev-redis-shared.sy1bg2.0001.use1.cache.amazonaws.com" );

let	cl = new Log({
	env : "dev",
	path : "/",
	module : "ui-test",
	log_entries_key : 1234
});	

simpleExample();
advancedExample();

function simpleExample(){
	let redis_key, promise;
	redis.createRedisClient();
	redis_key = redis.getRedisKey( "ui-test", 1234, "test-route", 4321 );
	redis.set( redis_key, "some data", true );
	promise = redis.get( redis_key );
	//call the promise
	promise.then( ret => {
		cl({ message : "The saved data:", args : [ ret ] });
		cl({ message : "Success getting cached data for redis key %s", args:[ redis_key ] });
		//ensure we are closing redis when done
		return;
	}).error( err => {
		cl({ log_level : "err", message : "failure retrieving data for redis key %s", args: [ redis_key ] });
		return;
	});
}

function advancedExample(){
	let redis_key, promise;
	let form_data = {
		searchId : 1234,
		listName : "Foo Bar",
		params : {
			foo : "bar",
			id : 122345
		}
	};
	redis.createRedisClient();
	redis_key = redis.getRedisKey( "ui-test", 4123444, "test-route", 4341234121 );
	redis.set( redis_key, JSON.stringify( form_data ) );
	promise = redis.get( redis_key );
	//call the promise
	promise.then( ret => {
		ret = JSON.parse( ret );
		cl({ message : "The saved data:" });

		cl( JSON.stringify( ret, null, 3 ) );
		cl({ message : "Success getting cached data for redis key %s", args:[ redis_key ] });
		//ensure we are closing redis when done
		return;
	}).error( err => {
		cl({ log_level : "err", message : "failure retrieving data for redis key %s", args: [ redis_key ] });
		return;
	});
}

function existsExample(){
	let redis_key, promise;
	redis.createRedisClient();
	redis_key = redis.getRedisKey( "ui-test", 4123444, "test-route", 4341234121 );
	promise = redis.exists( redis_key );
	promise.then( ( ret ) => cl( JSON.stringify( ret ) ) );
	setTimeout( () => redis.close(), 500 );
}

