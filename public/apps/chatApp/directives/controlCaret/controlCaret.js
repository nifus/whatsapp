(function (angular) {
    'use strict';

    function controlCaretDirective($rootScope) {
        return {
            restrict: 'A',
            link: controlCaretLink

        };


        function controlCaretLink($scope, element) {
            var position = 0;
            var node = element[0];
            var parent = null;
            // setCaret(node,position);
            var savedSelection = null;
            var sel = null;

            /*var editable = document.getElementById('textbox');
             editable.addEventListener('DOMNodeInserted', onChange, false);
             function onChange() {
             //console.log('insert')
             editable.innerHTML = editable.innerText;
             }*/

            $rootScope.$on('open_chat', function () {
                element.focus();
                sel = rangy.getSelection();

            });

            $rootScope.$on('submit_msg', function () {
                element.focus();
                node = element[0];
                sel = rangy.getSelection();
                parent = null;
            });


            element.on('keydown', function (e) {
                if (e.shiftKey === false && e.keyCode == 13) {
                    $rootScope.$broadcast('submit', element[0].innerHTML);
                    element[0].innerHTML = '';
                    e.preventDefault();
                }
            });
            element.on('keyup', function (e) {
                sel = rangy.getSelection();
                if (e.shiftKey === true && e.keyCode == 13) {
                    parent = getParentSelectedNode();
                    node = pastebrAtCaret('<br>');
                    sel = rangy.getSelection();
                    setCaret(sel.focusNode, sel.focusOffset);
                    e.preventDefault();
                }
            });


            element.on('mouseup', function () {
                //savedSelection = rangy.saveSelection();
                sel = rangy.getSelection();

                // node = getSelectedNode();
                //parent = getParentSelectedNode();
                //position = getCaretPosition(parent);
            });

            $rootScope.$on('insert_smiles', function (event, html) {

                setCaret(sel.focusNode, sel.focusOffset);
                // setCaret(node,position+1);
                // rangy.restoreSelection(sel);
                pasteHtmlAtCaret(html);
                //setCaret(sel.focusNode,sel.focusOffset+1);
                sel = rangy.getSelection();

                setCaret(sel.focusNode, sel.focusOffset);
                sel.focusNode.focus();

            });


        }


    }

    function getParentSelectedNode() {
        if (document.selection)
            return document.selection.createRange().parentElement();
        else {
            var selection = window.getSelection();
            if (selection.rangeCount > 0)
                return selection.getRangeAt(0).startContainer.parentNode;
        }
    }

    function getSelectedNode() {
        if (document.selection)
            return document.selection.createRange();
        else {
            var selection = window.getSelection();
            if (selection.rangeCount > 0)
                return selection.getRangeAt(0).startContainer;
        }
    }

    function getCaretPosition(editableDiv) {
        var caretPos = 0,
            sel, range;
        if (window.getSelection) {

            sel = window.getSelection();

            //console.log(sel)
            if (sel.rangeCount) {
                range = sel.getRangeAt(0);
                if (range.commonAncestorContainer.parentNode == editableDiv) {
                    caretPos = range.endOffset;
                }
            }
        } else if (document.selection && document.selection.createRange) {
            range = document.selection.createRange();
            if (range.parentElement() == editableDiv) {
                var tempEl = document.createElement("span");
                editableDiv.insertBefore(tempEl, editableDiv.firstChild);
                var tempRange = range.duplicate();
                tempRange.moveToElementText(tempEl);
                tempRange.setEndPoint("EndToEnd", range);
                caretPos = tempRange.text.length;
            }
        }
        return caretPos;
    }

    function pastebrAtCaret(html) {
        var sel, range;
        if (window.getSelection) {
            // IE9 and non-IE
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();

                // Range.createContextualFragment() would be useful here but is
                // non-standard and not supported in all browsers (IE9, for one)
                var el = document.createElement("br");
                var frag = document.createDocumentFragment(), node, lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);

                // Preserve the selection
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
                return el;
            }
        } else if (document.selection && document.selection.type != "Control") {
            // IE < 9
            document.selection.createRange().pasteHTML(html);
        }
    }

    function pasteHtmlAtCaret(html) {
        var sel, range;
        if (window.getSelection) {
            // IE9 and non-IE
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();

                // Range.createContextualFragment() would be useful here but is
                // non-standard and not supported in all browsers (IE9, for one)
                var el = document.createElement("div");
                el.innerHTML = html;
                var frag = document.createDocumentFragment(), node, lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);

                // Preserve the selection
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
                return el;
            }
        } else if (document.selection && document.selection.type != "Control") {
            // IE < 9
            document.selection.createRange().pasteHTML(html);
        }
    }

    function setCaret(el, position) {
        var range = document.createRange();
        var sel = window.getSelection();

        range.setStart(el, position);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        //el.focus();
    }

    angular.module('chatApp').directive('controlCaret', controlCaretDirective);


})(window.angular);
