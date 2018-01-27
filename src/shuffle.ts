export function Shuffle(arr: Array<any>) {
	var collection = arr,
		len = arr.length,
		rng = Math.random,
		random,
		temp;

	while (len) {
		random = Math.floor(rng() * len);
		len -= 1;
		temp = collection[len];
		collection[len] = collection[random];
		collection[random] = temp;
	}
};