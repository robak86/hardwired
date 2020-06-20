export class Base {
  static isAccepted(param) {
    console.log(this.name, param);
    // return param instanceof this;
    return param.constructor === this;
  }

  someFun() {}
}
class Extra extends Base {}

console.log(Base.isAccepted(new Base()));
console.log(Base.isAccepted(new Extra()));
console.log(Extra.isAccepted(new Base()));
console.log(Extra.isAccepted(new Extra()));

console.log(new Extra() instanceof Base);
