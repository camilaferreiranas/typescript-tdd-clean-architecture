import {LocalManagePurchases} from "@/data/usecases";
import {CacheStoreSpy, getCacheExpirationDate, mockPurchases} from "@/data/tests";

type SutTypes = {
    sut: LocalManagePurchases
    cacheStorage: CacheStoreSpy
}
const makeSut = (timestamp = new Date()): SutTypes => {
    const cacheStorage = new CacheStoreSpy();
    const sut = new LocalManagePurchases(cacheStorage, timestamp)
    return {
        sut, cacheStorage
    }
}


describe('LocalValidatePurchases', () => {
    test('Should not delete cache on init', () => {
        const {cacheStorage} = makeSut()
        expect(cacheStorage.actions).toEqual([]);

    })

    test('Should delete cache if load fails ', () => {
        const {cacheStorage, sut} = makeSut()
        cacheStorage.simulateFetchError();
        sut.validate();
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete]);
        expect(cacheStorage.deleteKey).toBe('purchases');
    })

    test('Should has no side effect if load succedess', () => {
       const currentDate = new Date()
        const timestamp = getCacheExpirationDate(currentDate);
         timestamp.setSeconds(timestamp.getSeconds() + 1)
        const {cacheStorage, sut} = makeSut(currentDate)
        cacheStorage.fetchResult = {
           timestamp
        }
        sut.validate();
       expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(cacheStorage.fetchKey).toBe('purchases')

    })

    test('Should delete if cache is expired ',  () => {
        const currentDate = new Date();
        const timestamp = getCacheExpirationDate(currentDate)
        timestamp.setSeconds(timestamp.getSeconds());
        const {cacheStorage, sut} = makeSut(currentDate)
        cacheStorage.fetchResult = {
            timestamp

        }
        sut.validate();
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete]);
        expect(cacheStorage.fetchKey).toBe('purchases');
        expect(cacheStorage.deleteKey).toBe('purchases');


    })
    test('Should delete if cache is on expiration date ',  () => {
        const currentDate = new Date();
        const timestamp = getCacheExpirationDate(currentDate)
        timestamp.setSeconds(timestamp.getSeconds());
        const {cacheStorage, sut} = makeSut(currentDate)
        cacheStorage.fetchResult = {
            timestamp
        }
        sut.validate();
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete]);
        expect(cacheStorage.fetchKey).toBe('purchases');
        expect(cacheStorage.deleteKey).toBe('purchases');


    })

})