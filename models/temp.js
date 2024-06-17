const agg = [
	{
		$match: {
			product: new ObjectId('666c43a084e3f99d379d2559'),
		},
	},
	{
		$group: {
			_id: null,
			averageRating: {
				$avg: '$rating',
			},
			numOfReviews: {
				$sum: 1,
			},
		},
	},
]

const client = await MongoClient.connect('')
const coll = client.db('e-commerce-api').collection('reviews')
const cursor = coll.aggregate(agg)
const result = await cursor.toArray()
await client.close()
