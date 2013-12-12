/** @namespace */
var SearchClass =  {

  //Hold the previous html without highlights
  oldHTML: '',

  /**
   * Class constructor
   * @param {searchArgs} obj All search parameters in order for this class to work
   * @returns {void}
   */
  init: function( searchArgs ) {
    if ( !this._isObject(searchArgs) ) {
      this._log('Wrong parameters type');
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
    for( var i=0; i<required.length; i++ ) {
      if( searchArgs.hasOwnProperty( required[i] ) ) {
        this[required[i]] = searchArgs[ required[i] ];
      }else {
        this._log('Class parameter missing');
        return;
      }
    }

    //Store textContainer HTML so it can be restore 
    this.oldHTML = this.txtContainer.innerHTML;

    //Event binders
    this.searchSubmit.addEventListener( 'click', this.triggerSearch );
  },

  /**
   * Get user input string and search for occurences
   * @param {string} str The search string
   * @returns {int}
   */
  triggerSearch: function(event) {
    var _this = SearchClass;
    event.preventDefault();

    //Get number of results
    var results = [
      _this._searchResults(_this.searchInput.value),
      _this.searchInput.value
    ]

    //Print the number of results
    _this.searchResult.textContent = _this._sprintf( _this.resultFoundTxt, results );

    return false;
  },

  /**
   * Get the number of search results
   * @param {string} str The search string
   * @returns {int}
   */
  _searchResults: function( str ) {
    //Get search RegExp
    var regExp = new RegExp( this._escapeRegExp( str.toLowerCase() ), 'ig' );

    //Get container innerText
    var innerText = ( this.txtContainer.textContent || this.txtContainer.innerText );

    //Try to match result
    var results = innerText.match(regExp);

    //Restore old HTML before modification
    this.txtContainer.innerHTML = this.oldHTML;

    //Get all occurances selection and highlight
    while ( match = regExp.exec( innerText ) ) {
      this._setSelectionRange( this.txtContainer, match.index, regExp.lastIndex );
      this._highligthText( this.highlightColor );
    }

    //Remove selection
    window.getSelection().removeAllRanges();

    //Return number of results
    return (results !== null) ? results.length : 0;
  },

  /**Highlight functions**/

  /**
   * Function to set the selection of a given occurance
   * @param {obj} node The node element
   * @returns {array}
   */
  _setSelectionRange: function ( node, start, end ) {
    var rg = document.createRange();
    rg.selectNodeContents( node );

    var txtNode;
    var txtNodes = this._getTxtNodesIn( node );
    var startFound = false;
    var charPos = 0;
    var endCharPos;

    var i = -1; 
    while ( true ) {
        txtNode = txtNodes[ ++i ];
        endCharPos = charPos + txtNode.length;

        if (
          ! startFound 
          && start >= charPos 
          && ( start < endCharPos || ( start === endCharPos && i < txtNodes.length ) ) 
        ) {
            rg.setStart( txtNode, start - charPos );
            startFound = true;
        }

        if ( startFound && end <= endCharPos ) {
            rg.setEnd( txtNode, end - charPos );
            break;
        }

        charPos = endCharPos;
    }

    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(rg);
  },

  /**
   * Function to highlight text based on 
   * @param {object} node The given node
   * @returns {array}
   */
  _highligthText: function ( color ) {
      sel = window.getSelection();
      if ( sel.rangeCount && sel.getRangeAt ) {
          var rg = sel.getRangeAt(0);
      }

      document.designMode = "on";

      if ( rg ) {
          sel.removeAllRanges();
          sel.addRange( rg );
      }

      // Moz and Webkit/Blink functions
      if ( ! document.execCommand("HiliteColor", false, color) ) {
          document.execCommand("BackColor", false, color);
      }

      document.designMode = "off";
  },


  /**Class helpers**/

  /**
   * Function to get text nodes inside a given node
   * @param {object} node The given node
   * @returns {array}
   */
  _getTxtNodesIn: function ( node ) {
    var txtNodes = [];

    //If we have a text node https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType
    if ( node.nodeType === 3 ) {
        txtNodes.push(node);
    } else {
        var children = node.childNodes;
        var length = children.length;
        
        //Recursive function to get all text nodes
        for ( var i = 0; i < length; i++ ) {
            txtNodes.push.apply( txtNodes, this._getTxtNodesIn( children[ i ] ) );
        }
    }

    return txtNodes;
  },

  /**
   * String escape for use in RegExp expression
   * @param {string} str The RegExp string
   * @returns {string} The escape RegExp string
   */
  _escapeRegExp: function( str ) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },

  /**
   * Kind of mimic php sprintf function
   * @param {string} str The search string
   * @returns {string} args The array of arguments
   */
  _sprintf: function( str, args ) {
    for( var i=0; i < args.length; i++ ) {
      str = str.replace( /%s/, args[i] );
    }
    return str;
  },

   /**
   * Check if the given argument is an object
   * @param {string} obj The object
   * @returns {bool} 
   */
  _isObject: function( obj ) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  },

  /**
   * JavaScript Helper log helper
   * @param {string} msg The log message
   * @returns {void} 
   */
  _log: function( msg ) {
    if( window.console ) {
      console.log(msg);
    }
  }

}

//Class parameters
var searchArgs =  {
  txtContainer:   document.getElementById('search_text'),
  searchInput:    document.getElementById('search_input'),
  searchSubmit:   document.getElementById('search_submit'),
  searchResult:   document.getElementById('search_result'),
  resultFoundTxt: 'Found %s occurences of the word \"%s\" in the below text.',
  highlightColor: 'yellow'
}

SearchClass.init(searchArgs);
