describe('ngAdvancedCache', function () {

    var $advancedCacheFactory;
    beforeEach(module('ngAdvancedCache'));
    beforeEach(inject(function ($injector) {
        $advancedCacheFactory = $injector.get('$advancedCacheFactory');
    }));

    describe('$advancedCacheFactory', function () {
        describe('$advancedCacheFactory()', function () {
            it('should be able to create a default cache', function () {
                var cache = $advancedCacheFactory('cache');
                expect(cache).toBeDefined();
                expect(cache.info().id).toEqual('cache');
                expect(cache.info().capacity).toEqual(Number.MAX_VALUE);
                expect(cache.info().maxAge).not.toBeDefined();
                expect(cache.info().cacheFlushInterval).not.toBeDefined();
                cache.destroy();
            });
            it('should be able to create a cache with options', function () {
                var options = {
                    capacity: Math.floor((Math.random()*100000)+1),
                    maxAge: Math.floor((Math.random()*100000)+1),
                    cacheFlushInterval: Math.floor((Math.random()*100000)+1)
                };
                var cache = $advancedCacheFactory('cache', options);
                expect(cache).toBeDefined();
                expect(cache.info().id).toEqual('cache');
                expect(cache.info().capacity).toEqual(options.capacity);
                expect(cache.info().maxAge).toEqual(options.maxAge);
                expect(cache.info().cacheFlushInterval).toEqual(options.cacheFlushInterval);
                cache.destroy();
                expect($advancedCacheFactory.get('cache')).not.toBeDefined();
            });
            it('should validate capacity', function () {
                var capacity = Math.floor((Math.random()*100000)+1) * -1;
                try {
                    $advancedCacheFactory('cache', { capacity: capacity });
                } catch (err) {
                    var msg = err.message;
                }
                expect(msg).toEqual('capacity must be greater than zero!;');
                capacity = 'asdfasd';
                try {
                    $advancedCacheFactory('cache', { capacity: capacity });
                } catch (err) {
                    msg = err.message;
                }
                expect(msg).toEqual('capacity must be a number!;');
            });
            it('should validate maxAge', function () {
                var maxAge = Math.floor((Math.random()*100000)+1) * -1;
                try {
                    $advancedCacheFactory('cache', { maxAge: maxAge });
                } catch (err) {
                    var msg = err.message;
                }
                expect(msg).toEqual('maxAge must be greater than zero!;');
                maxAge = 'asdfasd';
                try {
                    $advancedCacheFactory('cache', { maxAge: maxAge });
                } catch (err) {
                    msg = err.message;
                }
                expect(msg).toEqual('maxAge must be a number!;');
            });
            it('should validate cacheFlushInterval', function () {
                var cacheFlushInterval = Math.floor((Math.random()*100000)+1) * -1;
                try {
                    $advancedCacheFactory('cache', { cacheFlushInterval: cacheFlushInterval });
                } catch (err) {
                    var msg = err.message;
                }
                expect(msg).toEqual('cacheFlushInterval must be greater than zero!;');
                cacheFlushInterval = 'asdfasd';
                try {
                    $advancedCacheFactory('cache', { cacheFlushInterval: cacheFlushInterval });
                } catch (err) {
                    msg = err.message;
                }
                expect(msg).toEqual('cacheFlushInterval must be a number!;');
            });
            it('should prevent a cache from being duplicated', function () {
                try {
                    $advancedCacheFactory('cache');
                    $advancedCacheFactory('cache');
                } catch (err) {
                    var msg = err.message;
                }
                expect(msg).toEqual('cacheId cache taken!');
            });
            it('should require cacheId to be a string', function () {
                var shouldBeAStringMsg = 'cacheId must be a string!';
                try {
                    $advancedCacheFactory(3);
                } catch (err) {
                    var msg = err.message;
                }
                expect(msg).toEqual(shouldBeAStringMsg);
                try {
                    $advancedCacheFactory({obj: 'obj'});
                } catch (err) {
                    msg = err.message;
                }
                expect(msg).toEqual(shouldBeAStringMsg);
                try {
                    $advancedCacheFactory(['obj']);
                } catch (err) {
                    msg = err.message;
                }
                expect(msg).toEqual(shouldBeAStringMsg);
            });
        });
        describe('$advancedCacheFactory.get(cachedId)', function () {
            it('should return the correct cache with the specified cacheId', function () {
                var cache = $advancedCacheFactory('cache');
                expect($advancedCacheFactory.get('cache')).toEqual(cache);
                cache.destroy();
            });
            it('should return \"undefined\" if the cache doesn\'t exist', function () {
                expect($advancedCacheFactory.get('someNonExistentCache')).toEqual(undefined);
            });
        });
        describe('$advancedCacheFactory.info()', function () {
            it('should return the correct info for each cache produced by the factory', function () {
                var options = {
                    capacity: Math.floor((Math.random()*100000)+1),
                    maxAge: Math.floor((Math.random()*100000)+1),
                    cacheFlushInterval: Math.floor((Math.random()*100000)+1)
                };

                var cache = $advancedCacheFactory('cache');
                var cache2 = $advancedCacheFactory('cache2', {
                        maxAge: options.maxAge
                    });
                var cache3 = $advancedCacheFactory('cache3', {
                    capacity: options.capacity,
                    cacheFlushInterval: options.cacheFlushInterval
                });
                var info = $advancedCacheFactory.info();
                expect(info['cache'].id).toEqual('cache');
                expect(info['cache'].capacity).toEqual(Number.MAX_VALUE);
                expect(info['cache'].size).toEqual(0);

                expect(info['cache2'].id).toEqual('cache2');
                expect(info['cache2'].capacity).toEqual(Number.MAX_VALUE);
                expect(info['cache2'].size).toEqual(0);

                expect(info['cache3'].id).toEqual('cache3');
                expect(info['cache3'].cacheFlushInterval).toEqual(options.cacheFlushInterval);
                expect(info['cache3'].capacity).toEqual(options.capacity);
                expect(info['cache3'].size).toEqual(0);
                expect(info['cache3'].cacheFlushIntervalId).toBeDefined();
                cache.destroy();
                cache2.destroy();
                cache3.destroy();
            });
            it('should return \"undefined\" if the cache doesn\'t exist', function () {
                expect($advancedCacheFactory.get('someNonExistentCache')).toEqual(undefined);
            });
        });
    });

    describe('AdvancedCache', function () {
        it('should clear itself if cacheFlushInterval is specified', function () {
            var cache = $advancedCacheFactory('cache', { cacheFlushInterval: 1000 });
            cache.put('item1', 'value1');
            expect(cache.get('item1')).toEqual('value1');
            cache.put('item2', 'value2');
            expect(cache.get('item2')).toEqual('value2');
            waits(1500);
            runs(function () {
                expect(cache.get('item1')).toEqual(undefined);
                expect(cache.get('item2')).toEqual(undefined);
                cache.destroy();
            });
        });
        describe('AdvancedCache.put(key, value, options)', function () {
            it('should disallow keys that aren\'t a string', function () {
                var cache = $advancedCacheFactory('cache');
                var mustBeAStringMsg = 'The key must be a string!';
                try {
                    cache.put(2, 'value');
                } catch (err) {
                    var errorMsg = err.message;
                }
                expect(errorMsg).toEqual(mustBeAStringMsg);
                try {
                    cache.put(true, 'value');
                } catch (err) {
                    errorMsg = err.message;
                }
                expect(errorMsg).toEqual(mustBeAStringMsg);
                try {
                    cache.put({ obj: 'obj' }, 'value');
                } catch (err) {
                    errorMsg = err.message;
                }
                expect(errorMsg).toEqual(mustBeAStringMsg);
                cache.destroy();
            });
            it('should not add values that aren\'t defined', function () {
                var cache = $advancedCacheFactory('cache');
                cache.put('item', null);
                expect(cache.get('item')).toEqual(undefined);
                cache.put('item', undefined);
                expect(cache.get('item')).toEqual(undefined);
                cache.destroy();
            });
            it('should validate maxAge', function () {
                var cache = $advancedCacheFactory('cache');
                try {
                    cache.put('item', 'value', { maxAge: 'als;dlfkajsd'});
                } catch (err) {
                    var errorMsg = err.message;
                }
                expect(errorMsg).toEqual('maxAge must be a number!;');
                try {
                    cache.put('item', 'value', { maxAge: Math.floor((Math.random()*100000)+1) * -1 });
                } catch (err) {
                    errorMsg = err.message;
                }
                expect(errorMsg).toEqual('maxAge must be greater than zero!;');
                errorMsg = null;
                try {
                    cache.put('item', 'value', { maxAge: Math.floor((Math.random()*100000)+1) });
                } catch (err) {
                    errorMsg = 'should not reach this!';
                }
                expect(errorMsg).toEqual(null);
                cache.destroy();
            });
            it('should increase the size of the cache by one', function () {
                var cache = $advancedCacheFactory('cache');
                expect(cache.info().size).toEqual(0);
                cache.put('item', 'value1');
                expect(cache.info().size).toEqual(1);
                cache.put('item2', 'value2');
                expect(cache.info().size).toEqual(2);
                cache.destroy();
            });
            it('should overwrite an item if it is re-added to the cache', function () {
                var cache = $advancedCacheFactory('cache');
                expect(cache.info().size).toEqual(0);
                cache.put('item', 'value1');
                expect(cache.info().size).toEqual(1);
                cache.put('item', 'value2');
                expect(cache.info().size).toEqual(1);
                expect(cache.get('item')).toEqual('value2');
                cache.destroy();
            });
            it('should remove the least recently used item if the capacity has been reached', function () {
                var cache = $advancedCacheFactory('cache', { capacity: 2 });
                expect(cache.info().size).toEqual(0);
                cache.put('item1', 'value1');
                expect(cache.info().size).toEqual(1);
                cache.put('item2', 'value2');
                expect(cache.info().size).toEqual(2);
                cache.put('item3', 'value3');
                expect(cache.info().size).toEqual(2);
                expect(cache.get('item1')).toEqual(undefined);
                expect(cache.get('item2')).toEqual('value2');
                expect(cache.get('item3')).toEqual('value3');
                cache.get('item2');
                cache.put('item1', 'value1');
                expect(cache.get('item3')).toEqual(undefined);
                expect(cache.get('item1')).toEqual('value1');
                expect(cache.get('item2')).toEqual('value2');
                cache.destroy();
            });
            it('should set a timeout for an item to expire if maxAge for cache is specified', function () {
                var cache = $advancedCacheFactory('cache', { maxAge: 1000 });
                cache.put('item1', 'value1');
                expect(cache.get('item1')).toEqual('value1');
                waits(1500);
                runs(function () {
                    expect(cache.get('item1')).toEqual(undefined);
                    cache.destroy();
                });
            });
            it('should set a timeout for an item to expire if maxAge for item is specified', function () {
                var cache1 = $advancedCacheFactory('cache2');
                cache1.put('item1', 'value1', { maxAge: 1000 });
                expect(cache1.get('item1')).toEqual('value1');
                waits(1500);
                runs(function () {
                    expect(cache1.get('item1')).toEqual(undefined);
                    cache1.destroy();
                });
            });
            it('should maxAge for a specific item should override maxAge for the cache', function () {
                var cache = $advancedCacheFactory('cache', { maxAge: 3000 });
                cache.put('item1', 'value1', { maxAge: 1000 });
                expect(cache.get('item1')).toEqual('value1');
                waits(1500);
                runs(function () {
                    expect(cache.get('item1')).toEqual(undefined);
                    cache.destroy();
                });
            });
        });
        describe('AdvancedCache.get(key)', function () {
            it('should return the correct value for the specified key', function () {
                var cache = $advancedCacheFactory('cache');
                var value1 = 'value1',
                    value2 = 2,
                    value3 = {
                        value3: 'stuff'
                    };
                cache.put('item1', value1);
                cache.put('item2', value2);
                cache.put('item3', value3);
                expect(cache.get('item1')).toEqual(value1);
                expect(cache.get('item2')).toEqual(value2);
                expect(cache.get('item3')).toEqual(value3);
                cache.destroy();
            });
            it('should return undefined if the key isn\'t in the cache', function () {
                var cache = $advancedCacheFactory('cache');
                expect(cache.get('item')).toEqual(undefined);
                cache.destroy();
            });
        });
        describe('AdvancedCache.remove(key)', function () {
            it('should remove the item with the specified key', function () {
                var cache = $advancedCacheFactory('cache');
                var value1 = 'value1',
                    value2 = 2,
                    value3 = {
                        value3: 'stuff'
                    };
                cache.put('item1', value1);
                cache.put('item2', value2);
                cache.put('item3', value3);
                cache.remove('item1');
                expect(cache.get('item1')).toEqual(undefined);
                cache.remove('item2');
                expect(cache.get('item2')).toEqual(undefined);
                cache.remove('item3');
                expect(cache.get('item3')).toEqual(undefined);
                cache.destroy();
            });
            it('should reduce the size of the cache by one if the size is greater than zero', function () {
                var cache = $advancedCacheFactory('cache');
                cache.put('item1', 'value1');
                expect(cache.info().size).toEqual(1);
                cache.put('item2', 'value2');
                expect(cache.info().size).toEqual(2);
                cache.remove('item1');
                expect(cache.info().size).toEqual(1);
                cache.remove('item2');
                expect(cache.info().size).toEqual(0);
                cache.remove('item1');
                expect(cache.info().size).toEqual(0);
                cache.remove('item2');
                expect(cache.info().size).toEqual(0);
                cache.destroy();
            });
        });
        describe('AdvancedCache.removeAll()', function () {
            it('should remove all items in the cache', function () {
                var cache = $advancedCacheFactory('cache');
                var value1 = 'value1',
                    value2 = 2,
                    value3 = {
                        value3: 'stuff'
                    };
                cache.put('item1', value1);
                cache.put('item2', value2);
                cache.put('item3', value3);
                cache.removeAll();
                expect(cache.get('item1')).toEqual(undefined);
                expect(cache.get('item2')).toEqual(undefined);
                expect(cache.get('item3')).toEqual(undefined);
                cache.destroy();
            });
        });
        describe('AdvancedCache.destroy()', function () {
            it('should completely destroy the cache', function () {
                var cache = $advancedCacheFactory('cache');
                cache.destroy();
                expect($advancedCacheFactory.get('cache')).toEqual(undefined);
            });
        });
        describe('AdvancedCache.info()', function () {
            it('should return the correct values if they exist', function () {
                var cache = $advancedCacheFactory('cache');
                var cache2 = $advancedCacheFactory('cache2', { maxAge: 1000 });
                var cache3 = $advancedCacheFactory('cache3', { cacheFlushInterval: 1000 });
                var cache4 = $advancedCacheFactory('cache4', { capacity: 1000 });
                expect(cache.info()).toEqual({
                    id: 'cache',
                    capacity: Number.MAX_VALUE,
                    size: 0
                });
                cache.put('item', 'value');
                expect(cache.info()).toEqual({
                    id: 'cache',
                    capacity: Number.MAX_VALUE,
                    size: 1
                });
                expect(cache2.info()).toEqual({
                    id: 'cache2',
                    capacity: Number.MAX_VALUE,
                    maxAge: 1000,
                    size: 0
                });
                expect(cache3.info().id).toEqual('cache3');
                expect(cache3.info().capacity).toEqual(Number.MAX_VALUE);
                expect(cache3.info().cacheFlushInterval).toEqual(1000);
                expect(cache3.info().size).toEqual(0);
                expect(cache4.info()).toEqual({
                    id: 'cache4',
                    capacity: 1000,
                    size: 0
                });
                cache.destroy();
                cache2.destroy();
                cache3.destroy();
                cache4.destroy();
            });
        });
    });
});