
import * as Ac from "../gpg/agent_conf";
import * as fs from "fs";

const AgentConfString = `
# starting  comment
start-key value multiple values 1
# mid comment
start-key value multiple values 2
end-key value
# closing comment
`;

const UpdatedAgentConfString = `
# starting  comment
start-key value multiple values 1
# mid comment
start-key value multiple values 2
end-key test update
# closing comment

test-value juhu
end-key second update
`;

class TestAgentConf {
    createAndRead(assert: any) {
        let ac = Ac.AgentConf.read(AgentConfString);
        assert.equal(ac.lines.length, 8);
        assert.equal(ac.find('#').length, 3);
        assert.equal(ac.find('start-key').length, 2);
        assert.equal(ac.find('start-key')[0].value, 'value multiple values 1');
        assert.equal(ac.find('start-key')[1].value, 'value multiple values 2');
        assert.equal(ac.find('murks').length, 0);
        assert.equal(ac.find('end-key')[0].value, 'value');
        assert.equal(ac.asString(), AgentConfString)
        ac.find('end-key')[0].value = 'test update';
        ac.add(new Ac.AgentLine("test-value juhu"));
        ac.add(new Ac.AgentLine("end-key   second update"));
        assert.equal(ac.find('end-key').length, 2);
        assert.equal(ac.find('end-key')[0].value, 'test update');
        assert.equal(ac.find('end-key')[1].value, 'second update');
        assert.equal(ac.find('test-value')[0].value, 'juhu');
        assert.equal(ac.asString(), UpdatedAgentConfString);
        let fname = 'test-' + process.pid + '.agent';
        Ac.AgentConf.read_file(fname, (err: any, ag: Ac.AgentConf) => {
            assert.equal(ag.asString(), "");
            ac.write_file(fname, () => {
                Ac.AgentConf.read_file(fname, (err: any, ag: Ac.AgentConf) => {
                    assert.equal(ag.asString(), UpdatedAgentConfString);
                    fs.unlinkSync(fname);
                    assert.done();
                });
            });
        });
    }

}

module.exports = new TestAgentConf();
