module.exports = {
        setUp: function(done) {
            this.x = 1;
            done();
        },
        tearDown: function(done) {
            this.x = null;
            done();
        },
        'test function': function(t) {
            t.equal(this.x, 1);
            t.done();
        },
        'nested tests': {
            setUp: function(done) {
                this.y = 2;
                done();
            },
            'nested test function': function(t) {
                t.equal(this.x, 1);
                t.equal(this.y, 2);
                t.done()
            },
        },
    };
