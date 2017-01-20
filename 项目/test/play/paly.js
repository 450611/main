class Person{
    constructor ( name ){
        this.name = name;
        this.age = 12;
    }

    sayHello (){
        console.log( this.name);
    }
}


export default Person;