import Router from 'koa-router';
import cakeStore from './store';
import { broadcast } from "../utils";

export const router = new Router();

router.get('/', async (ctx) => {

    const response = ctx.response;
    const userId = ctx.state.user._id;
    const list=await cakeStore.find({ userId });
    response.body = list;
    response.status = 200; // ok
});

router.get('/:id', async (ctx) => {
    const userId = ctx.state.user._id;
    const cake = await cakeStore.findOne({ _id: ctx.params.id });
    const response = ctx.response;
    if (cake) {
        if (cake.userId === userId) {
            response.body = cake;
            response.status = 200; // ok
        } else {
            response.status = 403; // forbidden
        }
    } else {
        response.status = 404; // not found
    }
});
const createCake = async (ctx, cake, response) => {
    try {
        if (cake._id !==undefined)
        {
            delete cake._id;
        }
        const userId = ctx.state.user._id;
        console.log("in create cake"+userId);
        cake.userId = userId;
        response.body = await cakeStore.insert(cake);
        response.status = 201; // created
        broadcast(userId, { type: 'created', payload: cake });
    } catch (err) {
        console.log("eroare "+err);
        response.body = { message: err.message };
        response.status = 400; // bad request
    }
};
router.post('/', async ctx => await createCake(ctx, ctx.request.body, ctx.response));

router.put('/:id', async (ctx) => {
    const cake = ctx.request.body;
    const id = ctx.params.id;
    const cardId = cake._id;
    const response = ctx.response;
    if (cardId && cardId !== id) {
        response.body = { message: 'Param id and body _id should be the same' };
        response.status = 400; // bad request
        return;
    }
    if (!cardId) {
        await createCake(ctx, cake, response);
    } else {
        const updatedCount = await cakeStore.update({ _id: id }, cake);
        if (updatedCount === 1) {
            response.body = cake;
            response.status = 200; // ok
            const userId = ctx.state.user._id;
            broadcast(userId, { type: 'updated', payload: cake });
        } else {
            response.body = { message: 'Resource no longer exists' };
            response.status = 405; // method not allowed
        }
    }
});

router.del('/:id', async (ctx) => {
    const userId = ctx.state.user._id;
    const cake = await cakeStore.findOne({ _id: ctx.params.id });
    if (cake && userId !== cake.userId) {
        ctx.response.status = 403; // forbidden
    } else {
        await cakeStore.remove({ _id: ctx.params.id });
        ctx.response.status = 204; // no content
    }
});

