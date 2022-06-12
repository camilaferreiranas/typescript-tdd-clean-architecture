import {LocalSavePurchases} from "@/data/usecases";
import {CacheStore} from "@/data/protocols/cache";
import {SavePurchases} from "@/domain";


class CacheStoreSpy implements CacheStore{
    deleteCallsCount = 0
    insertCallsCount = 0
    insertValues: Array<SavePurchases.Params> = []
    deleteKey: string;
    insertKey: string;
    delete(key: string): void {
        this.deleteCallsCount++;
        this.deleteKey = key;
    }
    insert(key: string, value: any): void {
    this.insertCallsCount++;
    this.insertKey = key;
    this.insertValues = value;
    }

   simulateDeleteError(): void {
       jest.spyOn(CacheStoreSpy.prototype, 'delete').mockImplementationOnce(() => { throw  new Error()})
   }

   simulateInsertError(): void {
        jest.spyOn(CacheStoreSpy.prototype, 'insert').mockImplementationOnce(() => { throw  new Error()})
   }
}

type SutTypes = {
    sut: LocalSavePurchases
    cacheStorage: CacheStoreSpy
}
const makeSut = (): SutTypes => {
    const cacheStorage = new CacheStoreSpy();
    const sut = new LocalSavePurchases(cacheStorage)
    return {
        sut, cacheStorage
    }
}

const mockPurchases = (): Array<SavePurchases.Params> => [
    {
        id: '1',
        date: new Date(),
        value: 50
    },
    {
        id: '2',
        date: new Date(),
        value: 70
    },

]

describe('LocalSavePurchases', () => {
    test('Should not delete cache on init', () => {
      const {cacheStorage} = makeSut()
        expect(cacheStorage.deleteCallsCount).toBe(0);
    })
    test('Should delete on cache on save', async () => {
        const {cacheStorage, sut} = makeSut()
        const purchases = mockPurchases()
        await sut.save(purchases)
        expect(cacheStorage.deleteCallsCount).toBe(1);
        expect(cacheStorage.deleteKey).toBe('purchases');
    })
    test('Shouldnt insert new cache if delete fails ',  () => {
        const {cacheStorage, sut} = makeSut()
        const purchases = mockPurchases()
        cacheStorage.simulateDeleteError();
        const promise = sut.save(purchases);
        expect(cacheStorage.insertCallsCount).toBe(0);
        expect(promise).rejects.toThrow();
    })
    test('Should insert new cache if delete succeds ',   async () => {
        const {cacheStorage, sut} = makeSut()
        const purchases = mockPurchases()
        await sut.save(purchases);
        expect(cacheStorage.deleteCallsCount).toBe(1);
        expect(cacheStorage.insertCallsCount).toBe(1);
        expect(cacheStorage.insertKey).toBe('purchases');

    })



    test('Should insert new cache if delete succeds ',   async () => {
        const {cacheStorage, sut} = makeSut()
        const purchases = mockPurchases()
        await sut.save(purchases);
        expect(cacheStorage.deleteCallsCount).toBe(1);
        expect(cacheStorage.insertCallsCount).toBe(1);
        expect(cacheStorage.insertValues).toEqual(purchases);

    })
    test('Should throw if insert throws ',   async () => {
        const {cacheStorage, sut} = makeSut()
        cacheStorage.simulateInsertError();
        const promise = sut.save(mockPurchases())
        expect(cacheStorage.insertCallsCount).toBe(0);
        expect(promise).rejects.toThrow();

    })


})