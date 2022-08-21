

/**
 * 
 * @param {String} name 
 * @param {String} surname 
 * @param {String} id 
 * @param {String} mail 
 * @param {String} password 
 */

function User (name, surname, id, mail, password, score=0 ) {
    this.name = name;
    this.surname = surname;
    this.id=id;
    this.mail=mail;
    this.password = password;
    this.score = score;
}

exports.User = User;