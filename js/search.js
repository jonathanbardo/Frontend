/** @namespace */
var JB = JB || {};

JB.SearchText = (function (){
  var params = {},
      oldHTML = '';


  _triggerSearch = function (event) {
    event.preventDefault();

    //Get number of results
    var results = [
      _searchResults(params.searchInput.value),
      params.searchInput.value
    ]

    //Print the number of results
    params.searchResult.textContent = _sprintf(params.resultFoundTxt, results);

    return false;
  }

  /**
   * Get the number of search results
   * @param {string} str The search string
   * @returns {int}
   */
  _searchResults = function (str) {
    //Get search RegExp
    var regExp = new RegExp( _escapeRegExp( str.toLowerCase() ), 'ig' );

    //Get container innerText
    var innerText = (params.txtContainer.textContent || params.txtContainer.innerText);

    //Try to match result
    var results = innerText.match(regExp);

    //Restore old HTML before modification
    params.txtContainer.innerHTML = oldHTML;

    //Get all occurances selection and highlight
    while (match = regExp.exec(innerText)) {
      _setSelectionRange( params.txtContainer, match.index, regExp.lastIndex );
      _highligthText( params.highlightColor );
    }

    //Remove selection
    window.getSelection().removeAllRanges();

    //Return number of results
    return (results !== null) ? results.length : 0;
  }

  /**Highlight functions**/

  /**
   * Function to set the selection of a given occurance
   * @param {obj} node The node element
   * @returns {array}
   */
  _setSelectionRange = function (node, start, end) {
    var rg = document.createRange(),
        txtNode,
        txtNodes = _getTxtNodesIn( node ),
        startFound = false,
        charPos = 0,
        endCharPos,
        sel,
        i = -1;

    rg.selectNodeContents(node);

    while (true) {
        txtNode = txtNodes[ ++i ];
        endCharPos = charPos + txtNode.length;

        if (
          ! startFound 
          && start >= charPos 
          && (start < endCharPos || (start === endCharPos && i < txtNodes.length)) 
        ) {
            rg.setStart(txtNode, start - charPos);
            startFound = true;
        }

        if (startFound && end <= endCharPos) {
            rg.setEnd( txtNode, end - charPos );
            break;
        }

        charPos = endCharPos;
    }

    sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(rg);
  }

  /**
   * Function to highlight text based on 
   * @param {object} node The given node
   * @returns {array}
   */
  _highligthText = function (color) {
      sel = window.getSelection();
      if (sel.rangeCount && sel.getRangeAt) {
          var rg = sel.getRangeAt(0);
      }

      document.designMode = "on";

      if (rg) {
          sel.removeAllRanges();
          sel.addRange( rg );
      }

      // Moz and Webkit/Blink functions
      if (!document.execCommand("HiliteColor", false, color)) {
          document.execCommand("BackColor", false, color);
      }

      document.designMode = "off";
  }


  /**Class helpers**/

  /**
   * Function to get text nodes inside a given node
   * @param {object} node The given node
   * @returns {array}
   */
  _getTxtNodesIn = function (node) {
    var txtNodes = [];

    //If we have a text node https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType
    if (node.nodeType === 3) {
        txtNodes.push(node);
    } else {
        var children = node.childNodes;
        var length = children.length;
        
        //Recursive function to get all text nodes
        for (var i = 0; i < length; i++) {
            txtNodes.push.apply(txtNodes, _getTxtNodesIn(children[i]));
        }
    }

    return txtNodes;
  }

  /**
   * String escape for use in RegExp expression
   * @param {string} str The RegExp string
   * @returns {string} The escape RegExp string
   */
  _escapeRegExp = function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  /**
   * Kind of mimic php sprintf function
   * @param {string} str The search string
   * @returns {string} args The array of arguments
   */
  _sprintf = function (str, args) {
    for (var i=0; i < args.length; i++) {
      str = str.replace(/%s/, args[i]);
    }
    return str;
  }

   /**
   * Check if the given argument is an object
   * @param {string} obj The object
   * @returns {bool} 
   */
  _isObject = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  /**
   * JavaScript Helper log helper
   * @param {string} msg The log message
   * @returns {void} 
   */
  _log = function (msg) {
    if (window.console) {
      console.log(msg);
    }
  }

  return {
    init: function (searchArgs) {
      if (!_isObject(searchArgs)) {
        _log('Wrong parameters type');
        return;
      }

      //Required args
      var required = [
        'txtContainer',
        'searchInput',
        'searchSubmit',
        'searchResult',
        'resultFoundTxt',
        'highlightColor'
      ];

      //Assign passed parameters to class properties
      for (var i=0; i<required.length; i++) {
        if (searchArgs.hasOwnProperty(required[i])) {
          params[required[i]] = searchArgs[required[i]];
        } else {
          _log('Class parameter missing');
          return;
        }
      }

      //Store textContainer HTML so it can be restore 
      oldHTML = params.txtContainer.innerHTML;

      //Event binders
      params.searchSubmit.addEventListener('click', _triggerSearch);
    }
  }
})();

//Class parameters
var searchArgs =  {
  txtContainer: document.getElementById('search_text'),
  searchInput: document.getElementById('search_input'),
  searchSubmit: document.getElementById('search_submit'),
  searchResult: document.getElementById('search_result'),
  resultFoundTxt: 'Found %s occurences of the word \"%s\" in the below text.',
  highlightColor: 'yellow'
}

JB.SearchText.init(searchArgs);
