import dataStore from 'nedb-promise';

export class CakeStore {
    constructor({ filename, autoload }) {
        this.store = dataStore({ filename, autoload });
    }

    async find(props) {
        return this.store.find(props);
    }

    async findOne(props) {
        return this.store.findOne(props);
    }

    async insert(cake) {
        // let noteText = note.text;
        // if (!noteText) { // validation
        //   throw new Error('Missing text property')
        // }
        console.log("insert");
        return this.store.insert(cake);
    };

    async update(props, cake) {
        console.log("update");
        return this.store.update(props, cake);
    }

    async remove(props) {
        return this.store.remove(props);
    }
}

export default new CakeStore({ filename: './db/cake.json', autoload: true });
