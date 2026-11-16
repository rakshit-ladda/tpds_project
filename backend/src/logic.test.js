import test from 'node:test';import assert from 'node:assert/strict';import {priority,similarity} from './logic.js';
test('priority stays within 0..100',()=>{for(const severity of [1,3,5]){const p=priority({severity,impact:5,category:'IT',created_at:new Date().toISOString(),confirmation_count:100});assert.ok(p.score>=0&&p.score<=100)}});
test('electrical emergency escalates',()=>assert.equal(priority({severity:5,impact:1,category:'Electrical',created_at:new Date().toISOString()}).score,100));
test('duplicate title similarity',()=>assert.equal(similarity('broken water cooler','broken water cooler'),1));
