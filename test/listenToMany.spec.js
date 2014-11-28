var assign = require('react/lib/Object.assign'),
    assert = require('chai').assert,
    sinon = require('sinon'),
    listenToMany = require('../src/listenToMany'),
    Reflux = require('../src');

describe('the listenToMany shorthand',function() {

    describe("when calling the factory",function() {
        var unsubscriber = sinon.spy(),
            listenable1 = {listen: sinon.stub().returns(unsubscriber)},
            listenable2 = {listen: sinon.stub().returns(unsubscriber)},
            listenables = {
                firstAction: listenable1,
                secondAction: listenable2
            },
            context = {
                onFirstAction: sinon.spy(),
                onSecondAction: sinon.spy()
            },
            result = assign(context, Reflux.ListenerMixin, listenToMany(listenables));

        it("should return object with componentWillMount and componentWillUnmount methods",function(){
            assert.isFunction(result.componentWillMount);
            assert.isFunction(result.componentWillUnmount);
        });

        describe("when calling the added componentWillMount",function(){
            result.componentWillMount();

            it("should add all methods from ListenerMethods",function(){
                for(var m in Reflux.ListenerMethods){
                    assert.equal(result[m],Reflux.ListenerMethods[m]);
                }
            });

            it("should add to a subscriptions array (via listenToMany)",function(){
                var subs = result.subscriptions;
                assert.isArray(subs);
                assert.equal(subs[0].listenable,listenable1);
                assert.equal(subs[1].listenable,listenable2);
            });

            it("should call listen on the listenables correctly (via listenToMany)",function(){
                assert.equal(listenable1.listen.callCount,1);
                assert.deepEqual(listenable1.listen.firstCall.args,[context.onFirstAction,result]);
                assert.equal(listenable2.listen.callCount,1);
                assert.deepEqual(listenable2.listen.firstCall.args,[context.onSecondAction,result]);
            });
        });

        describe("the componentWillUnmount method",function(){

            it("should be the same as ListenerMethods stopListeningToAll",function(){
                assert.equal(assert.equal(result.componentWillUnmount,Reflux.ListenerMethods.stopListeningToAll));
            });
        });
    });
});
