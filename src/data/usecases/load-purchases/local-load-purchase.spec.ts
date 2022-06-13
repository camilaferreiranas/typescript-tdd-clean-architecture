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


describe('LocalLoadPurchase', () => {
    test('Should not delete cache on init', () => {
        const {cacheStorage} = makeSut()
        expect(cacheStorage.actions).toEqual([]);
    })


    test('Should return empty list if load fails ', async () => {
        const {cacheStorage, sut} = makeSut()
        cacheStorage.simulateFetchError();
        const purchases = await sut.loadAll();
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch]);
        expect(purchases).toEqual([])
    })

    test('Should return a list of purchases if cache is valid', async () => {
        const currentDate = new Date();
        const timestamp = getCacheExpirationDate(currentDate);
        timestamp.setSeconds(timestamp.getSeconds() + 1);
        const {cacheStorage, sut} = makeSut(currentDate)
        cacheStorage.fetchResult = {
            timestamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll();
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch]);
        expect(cacheStorage.fetchKey).toBe('purchases');
        expect(purchases).toEqual(cacheStorage.fetchResult.value)
    })
    test('Should have no side effects if cache is invalid', async () => {
        const currentDate = new Date();
        const timestamp = getCacheExpirationDate(currentDate);
        timestamp.setSeconds(timestamp.getSeconds() - 1);
        const {cacheStorage, sut} = makeSut(currentDate)
        cacheStorage.fetchResult = {
            timestamp,

        }
        const purchases = await sut.loadAll();
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch]);
        expect(cacheStorage.fetchKey).toBe('purchases');
        expect(purchases).toEqual([])
    })

    test('Should have no side effects if cache is on expiration date ', async () => {
        const currentDate = new Date();
        const timestamp = getCacheExpirationDate(currentDate)
        timestamp.setSeconds(timestamp.getSeconds());
        const {cacheStorage, sut} = makeSut(currentDate)
        cacheStorage.fetchResult = {
            timestamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll();
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch]);
        expect(cacheStorage.fetchKey).toBe('purchases');
        expect(purchases).toEqual([])
    })

    test('Should return an empty list if cache is empty ', async () => {
        const currentDate = new Date();
        const timestamp = getCacheExpirationDate(currentDate);
        timestamp.setSeconds(timestamp.getSeconds() + 1);
        const {cacheStorage, sut} = makeSut(currentDate)
        cacheStorage.fetchResult = {
            timestamp,
            value: []
        }
        const purchases = await sut.loadAll();
        expect(cacheStorage.actions).toEqual([CacheStoreSpy.Action.fetch]);
        expect(cacheStorage.fetchKey).toBe('purchases');
        expect(purchases).toEqual([])
    })
})