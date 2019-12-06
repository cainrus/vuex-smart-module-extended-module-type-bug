import { Actions, createMapper, Getters, Module, Mutations } from 'vuex-smart-module';
import { ComponentMapper } from 'vuex-smart-module/lib/mapper';
import { ModuleOptions } from 'vuex-smart-module/lib/module';
import { Store } from 'vuex';
import { Vue, Component } from 'vue-property-decorator'


abstract class BaseState {
    $created: number;
    constructor() {
        this.$created = Date.now();
    }
}

abstract class BaseGetters<S> extends Getters<S> {

}

abstract class BaseActions<
    S,
    G extends BaseGetters<S>,
    M extends BaseMutations<S>,
    A extends BaseActions<S, G, M, A>,
    > extends Actions<S, G, M, A> {
}

abstract class BaseMutations<S> extends Mutations<S> {

}

export interface BaseModuleOptions<S extends BaseState,
    G extends BaseGetters<S>,
    M extends BaseMutations<S>,
    A extends BaseActions<S, G, M, A>,
    > extends ModuleOptions<S,
    G,
    M,
    A> {
    name: string;
}

class BaseModule<S extends BaseState,
    G extends BaseGetters<S>,
    M extends BaseMutations<S>,
    A extends BaseActions<S, G, M, A>,
    > extends Module<S, G, M, A> {

    readonly name: string;
    private mappers: ComponentMapper<S, G, M, A> | null = null;

    constructor(options: BaseModuleOptions<S, G, M, A>) {
        super(options as ModuleOptions<S, G, M, A>);
        this.name = options.name;
    }
}



class UserState extends BaseState {
    name = 'Sam';
    surname ='Smith';
    age = 45;
    dept = 0;
    credits = 100;
}

class UserGetters extends BaseGetters<UserState> {
    get fullName() {
        return `${this.state.name} ${this.state.surname}`
    }
    get maxDept() {
        return Math.max(0, 100 - this.state.dept);
    }
}
class UserMutations extends BaseMutations<UserState> {
    setCredits(amount: number) {
        this.state.credits = amount;
    }
    setDept(amount: number) {
        this.state.dept = amount;
    }
}

class UserActions extends BaseActions<UserState, UserGetters, UserMutations, UserActions> {
    takeLoan(amount: number): boolean {
        if (this.getters.maxDept > amount) {
            this.mutations.setDept(this.state.dept + amount);
            this.mutations.setCredits(this.state.credits + amount);
            return true;
        }
        return false;
    }
}

const user = new BaseModule({
    name: 'user',
    state: UserState,
    getters: UserGetters,
    mutations: UserMutations,
    actions: UserActions,
});


const store = new Store({});


const Mappers = Vue.extend({
    methods: createMapper(user).mapActions(['takeLoan']),
});


@Component
export default class User extends Mappers {
    async mounted() {
        // result is not typed
        const takeLoadResult1 = await this.takeLoan(1);
        // result is not typed
        const takeLoadResult2 = await user.context(store).actions.takeLoan(10);

    }
}
