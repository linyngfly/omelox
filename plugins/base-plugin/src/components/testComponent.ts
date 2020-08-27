import { IComponent, Application } from 'omelox';


export class TestComponent implements IComponent {
    name = 'TestComponent';
    constructor(app: Application, opts: any) {
        console.log(`TestComponent constructor app:${app.getBase()} opts:${opts ? JSON.stringify(opts) : ''}`);
    }
}