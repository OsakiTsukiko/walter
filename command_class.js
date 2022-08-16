const conf = require('./conf.json');

module.exports = {
    Command: class {
        constructor (name, call, description, usage, fn) {
            this.name = name;
            this.call = call;
            this.description = description;
            this.usage = conf.discord.prefix + usage;
            this.fn = fn;
        }
    }
}