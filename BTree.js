(function () {
    'use strict';

    var app = angular.module('REFProject.Common.BTree', []);

    app.factory('BTree', function () {

        function BTree(order) {
            this.order = order;
            this.values = [];
            this.children = [];
        }

        BTree.prototype.pickChild = function (value) {
            let hasOpenSlots = ((this.children.length - 1) - this.values.length) > 0;
            if (this.children.length !== 0 && !hasOpenSlots) {
                for (var destination = 0; destination < this.values.length; destination++) {
                    if (value < this.values[destination]) {
                        break;
                    }
                }
                return destination;
            }
            return null;
        };

        BTree.prototype.sortNode = function () {
            this.values.sort(function (a, b) {
                return a - b;
            });
        };

        BTree.prototype.isOverloaded = function () {
            return this.values.length === this.order;
        };

        BTree.prototype.split = function () {
            let leftSplit = new BTree(this.order);
            let rightSplit = new BTree(this.order);

            leftSplit.values = this.values.splice(0, Math.ceil(this.values.length / 2) - 1);
            let median = this.values.splice(0, 1)[0];
            rightSplit.values = this.values.splice(0);

            for (let i = 0; i < this.children.length; i++) {
                if (i + 1 <= this.children.length / 2) {
                    this.children[i].parentBTreeNode = leftSplit;
                } else {
                    this.children[i].parentBTreeNode = rightSplit;
                }
            }
            leftSplit.children = this.children.splice(0, this.children.length / 2);
            rightSplit.children = this.children.splice(0);

            if (this.parentBTreeNode) {
                let parentBTreeNode = this.parentBTreeNode;
                leftSplit.parentBTreeNode = parentBTreeNode;
                rightSplit.parentBTreeNode = parentBTreeNode;
                let destination = parentBTreeNode.pickChild(leftSplit.values[0]);
                parentBTreeNode.children.splice(destination, 1, leftSplit, rightSplit);
                parentBTreeNode.insert(median);
            } else {
                this.values[0] = median;
                this.children = [leftSplit, rightSplit];
                leftSplit.parentBTreeNode = this;
                rightSplit.parentBTreeNode = this;
            }
        };

        BTree.prototype.insert = function (value) {
            let destination = this.pickChild(value);
            if (typeof destination === 'number') {
                this.insert.call(this.children[destination], value);
            } else {
                this.values.push(value);
                this.sortNode();
                if (this.isOverloaded()) {
                    this.split();
                }
            }
        };


        BTree.prototype.find = function (value, startNode) {
            if (!startNode) {
                startNode = this;
            }
            var defaultResult = null;

            for (var i = 0; i < startNode.values.length; i++) {
                let j = i + 1;

                if (value < startNode.values[i]) {
                    if (startNode.children[i]) {
                        return this.find(value, startNode.children[i]);
                    } else {
                        return defaultResult;
                    }
                } else if (value === startNode.values[i]) {
                    return startNode.values[i];
                } else if (j === startNode.values.length && startNode.children[j]) {
                    return this.find(value, startNode.children[j]);
                }
            }

            return defaultResult;
        };


        BTree.prototype.pickChildObject = function (value) {
            let hasOpenSlots = ((this.children.length - 1) - this.values.length) > 0;

            if (this.children.length !== 0 && !hasOpenSlots) {
                for (var destination = 0; destination < this.values.length; destination++) {
                    if (value.id < this.values[destination].id) {
                        break;
                    }
                }
                return destination;
            }
            return null;
        };

        BTree.prototype.sortNodeObject = function () {
            this.values.sort(function (a, b) {
                return a.id - b.id;
            });


            let valuesStr = '';
            for (var i = 0; i < this.values.length; i++) {
                valuesStr += ' -> ' + this.values[i].id;
            }
        };

        BTree.prototype.splitObject = function () {
            let leftSplit = new BTree(this.order);
            let rightSplit = new BTree(this.order);

            leftSplit.values = this.values.splice(0, Math.ceil(this.values.length / 2) - 1);
            let median = this.values.splice(0, 1)[0];
            rightSplit.values = this.values.splice(0);

            for (let i = 0; i < this.children.length; i++) {
                if (i + 1 <= this.children.length / 2) {
                    this.children[i].parentBTreeNode = leftSplit;
                } else {
                    this.children[i].parentBTreeNode = rightSplit;
                }
            }

            leftSplit.children = this.children.splice(0, this.children.length / 2);
            rightSplit.children = this.children.splice(0);

            if (this.parentBTreeNode) {
                let parentBTreeNode = this.parentBTreeNode;
                leftSplit.parentBTreeNode = parentBTreeNode;
                rightSplit.parentBTreeNode = parentBTreeNode;
                let destination = parentBTreeNode.pickChildObject(leftSplit.values[0]);
                parentBTreeNode.children.splice(destination, 1, leftSplit, rightSplit);
                parentBTreeNode.insertObject(median);
            } else {
                this.values[0] = median;
                this.children = [leftSplit, rightSplit];
                leftSplit.parentBTreeNode = this;
                rightSplit.parentBTreeNode = this;
            }
        };

        BTree.prototype.insertObject = function (value) {
            let destination = this.pickChildObject(value);
            if (typeof destination === 'number') {
                this.insertObject.call(this.children[destination], value);
            } else {
                this.values.push(value);
                this.sortNodeObject();
                if (this.isOverloaded()) {
                    this.splitObject();
                }
            }
        };

        BTree.prototype.findById = function (id, startNode) {
            if (!startNode) {
                startNode = this;
            }
            var defaultResult = null;

            for (var i = 0; i < startNode.values.length; i++) {
                let j = i + 1;

                if (id < startNode.values[i].id) {
                    if (startNode.children[i]) {
                        return this.findById(id, startNode.children[i]);
                    } else {
                        return defaultResult;
                    }
                } else if (id === startNode.values[i].id) {
                    return startNode.values[i];
                } else if (j === startNode.values.length && startNode.children[j]) {
                    return this.findById(id, startNode.children[j]);
                }
            }

            return defaultResult;
        };


        // traverse all nodes
        BTree.prototype.traverse = function (callback) {
            callback(this);
            for (var i = 0; i < this.children.length; i++) {
                this.traverse.call(this.children[i], callback);
            }
        };

        BTree.prototype.print = function () {
            let results = [];
            this.traverse(function (node) {
                results.push(node.values);
            });
            return JSON.stringify(results);
        };

        return BTree;
    });
})();