/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Java for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Java.procedures');

goog.require('Blockly.Java');


Blockly.Java['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = Blockly.Java.variableDB_.getName(
    block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var branch, info;
  [branch, info] = Blockly.Java.statementToCode(block, 'STACK');
  if (Blockly.Java.STATEMENT_PREFIX) {
    branch = Blockly.Java.prefixLines(
        Blockly.Java.STATEMENT_PREFIX.replace(/%1/g,
          '\'' + block.id + '\''), Blockly.Java.INDENT) + branch;
  }
  if (Blockly.Java.INFINITE_LOOP_TRAP) {
    branch = Blockly.Java.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.Java.valueToCode(block, 'RETURN',
      Blockly.Java.ORDER_NONE) || '';

  info = infoModify(info, 1);

  //Determine return type
  var returnType = undefined;
  if(!returnValue || returnValue === '') returnType = 'void';
  else
    returnType = workspace.getTypeOfVariable(returnValue);

  //make returnValue a whole sentence
  if (returnValue) {
    returnValue = '  return ' + returnValue + ';\n';
  }
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Java.variableDB_.getName(block.arguments_[i],
      Blockly.Variables.NAME_TYPE);
  }
  for(var i = 0; i < args.length; i++){
    //args[i] = args[i].split('-')[0] + ' ' + args[i].split('-')[1]
    var argType, argValue;
    argType = workspace.getTypeOfVariable(args[i]);
    args[i] = argType + ' ' + argValue;
  }
  var code = 'private ' + returnType + ' ' + funcName +
    '(' + args.join(', ') + ') {\n' + branch + (returnValue || '') + '}';
  [code, info] = Blockly.Java.scrub_(block, code, info);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.Java.definitions_['%' + funcName] = code;
  Blockly.Java.definitionsInfo_['%' + funcName] = info;
  return [null, {}];
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Java['procedures_defnoreturn'] =
  Blockly.Java['procedures_defreturn'];

Blockly.Java['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Java.variableDB_.getName(
    block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Java.valueToCode(block, 'ARG' + i,
        Blockly.Java.ORDER_COMMA) || 'None';
  }
  for(var i = 0; i < args.length; i++){
    args[i] = args[i].split('-')[1] || args[i].split('_')[1];
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.Java.variableDB_.getName(
    block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Java.valueToCode(block, 'ARG' + i,
        Blockly.Java.ORDER_COMMA) || 'None';
  }
  for(var i = 0; i < args.length; i++){
    args[i] = args[i].split('-')[1] || args[i].split('_')[1];
  }
  var code = funcName + '(' + args.join(', ') + ');\n';
  return code;
};

Blockly.Java['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.Java.valueToCode(block, 'CONDITION',
      Blockly.Java.ORDER_NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (block.hasReturnValue_) {
    var value = Blockly.Java.valueToCode(block, 'VALUE',
        Blockly.Java.ORDER_NONE) || 'None';
    code += '  return ' + value + ';\n';
  } else {
    code += '  return;\n';
  }
  code += '}\n';
  return code;
};
