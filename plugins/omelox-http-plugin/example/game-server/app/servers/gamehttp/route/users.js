
// "database"

const posts = [];

moduel.exports = (router)=>{
    router.prefix = '/users';

    router.get('/', async (ctx)=>{
        await ctx.render('list', { posts: posts });
    });

    router.get('/bar', async (ctx)=>{
        ctx.body = 'this is a users/bar response'
    });
};