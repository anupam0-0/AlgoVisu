
import { bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, heapSort, SortElement } from '../../lib/algorithms/sorting';

describe('Sorting Algorithms', () => {
    const createArray = (values: number[]): SortElement[] => {
        return values.map((v, i) => ({ value: v, id: i }));
    };

    const verifySorted = (arr: SortElement[]) => {
        for (let i = 0; i < arr.length - 1; i++) {
            expect(arr[i].value).toBeLessThanOrEqual(arr[i + 1].value);
        }
    };

    test('Bubble Sort sorts correctly', () => {
        const input = createArray([5, 3, 8, 4, 2]);
        const steps = bubbleSort(input);
        const finalState = steps[steps.length - 1].array;
        verifySorted(finalState);
        expect(finalState.length).toBe(5);
    });

    test('Selection Sort sorts correctly', () => {
        const input = createArray([5, 3, 8, 4, 2]);
        const steps = selectionSort(input);
        const finalState = steps[steps.length - 1].array;
        verifySorted(finalState);
    });

    test('Insertion Sort sorts correctly', () => {
        const input = createArray([5, 3, 8, 4, 2]);
        const steps = insertionSort(input);
        const finalState = steps[steps.length - 1].array;
        verifySorted(finalState);
    });

    test('Merge Sort sorts correctly', () => {
        const input = createArray([5, 3, 8, 4, 2]);
        const steps = mergeSort(input);
        // Merge sort might replace objects, but value order should be correct
        const finalState = steps[steps.length - 1].array;
        verifySorted(finalState);
    });

    test('Quick Sort sorts correctly', () => {
        const input = createArray([5, 3, 8, 4, 2]);
        const steps = quickSort(input);
        const finalState = steps[steps.length - 1].array;
        verifySorted(finalState);
    });

    test('Heap Sort sorts correctly', () => {
        const input = createArray([5, 3, 8, 4, 2]);
        const steps = heapSort(input);
        const finalState = steps[steps.length - 1].array;
        verifySorted(finalState);
    });

    test('Sorting handles already sorted array', () => {
        const input = createArray([1, 2, 3, 4, 5]);
        const steps = bubbleSort(input);
        const finalState = steps[steps.length - 1].array;
        verifySorted(finalState);
    });

    test('Sorting handles reverse sorted array', () => {
        const input = createArray([5, 4, 3, 2, 1]);
        const steps = bubbleSort(input);
        const finalState = steps[steps.length - 1].array;
        verifySorted(finalState);
    });
});
