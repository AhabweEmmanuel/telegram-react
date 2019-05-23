/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { EventEmitter } from 'events';
import TdLibController from '../Controllers/TdLibController';

class PollStore extends EventEmitter {
    constructor() {
        super();

        this.poll = null;

        this.addTdLibListener();
        this.setMaxListeners(Infinity);
    }

    onUpdate = update => {};

    onClientUpdate = update => {
        switch (update['@type']) {
            case 'clientUpdateNewPoll': {
                this.set({
                    '@type': 'inputMessagePoll',
                    question: '',
                    options: []
                });

                this.emit('clientUpdateNewPoll', update);
                break;
            }
            case 'clientUpdatePollQuestion': {
                const { question } = update;

                this.assign(this.poll, { question });

                this.emit('clientUpdatePollQuestion', update);
                break;
            }
            case 'clientUpdatePollOption': {
                const { id, text } = update;

                this.assign(this.poll, { options: options.map(x => (x.id === id ? { ...x, text } : { ...x })) });

                this.emit('clientUpdatePollOption', update);
                break;
            }
            case 'clientUpdateNewPollOption': {
                const { option } = update;

                this.assign(this.poll, { options: [...options, option] });
                this.emit('clientUpdateNewPollOption', update);
                break;
            }
            case 'clientUpdateDeletePollOption': {
                const { id } = update;

                this.assign(this.poll, { options: options.filter(x => x.id !== id) });
                this.emit('clientUpdateDeletePollOption', update);
                break;
            }
            case 'clientUpdateDeletePoll': {
                this.poll = null;

                this.emit('clientUpdateDeletePoll', update);
                break;
            }
            default:
                break;
        }
    };

    addTdLibListener = () => {
        TdLibController.addListener('update', this.onUpdate);
        TdLibController.addListener('clientUpdate', this.onClientUpdate);
    };

    removeTdLibListener = () => {
        TdLibController.removeListener('update', this.onUpdate);
        TdLibController.removeListener('clientUpdate', this.onClientUpdate);
    };

    assign(source1, source2) {
        this.set(Object.assign({}, source1, source2));
    }

    set(poll) {
        this.poll = poll;
    }
}

const store = new PollStore();
window.poll = store;
export default store;