moduel.exports = (router)=>{
    router.prefix = '/';

    router.get('/', async (ctx)=>{
		await ctx.render('index', {
			title: 'Hello Koa 2!'
		})
    });

    router.get('/string', async (ctx)=>{
		title: 'Hello Koa 2!'
	});
	
	router.get('/json', async (ctx) => {
		ctx.body = {
			title: 'koa2 json'
		}
	})
};