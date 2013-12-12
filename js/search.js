/** @namespace */
var SearchClass =  {

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
      'searchInputID',
      'searchSubmitID',
      'searchResultID',
      'resultFoundTxt'
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

    //Event binders
    this.searchSubmitID.addEventListener( 'click', this.triggerSearch );
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
      _this._searchResults(_this.searchInputID.value),
      _this.searchInputID.value
    ]

    //Print the number of results
    _this.searchResultID.textContent = _this._sprintf( _this.resultFoundTxt, results );

    return false;
  },

  /**
   * Get the number of search results
   * @param {string} str The search string
   * @returns {int}
   */
  _searchResults: function( str ) {
    //Get search RegExp
    var regExp = new RegExp( this.escapeRegExp( str.toLowerCase() ), 'ig' );

    //Get container innerText
    var innerText = ( this.txtContainer.textContent || this.txtContainer.innerText );

    //Try to match result
    var results = innerText.match(regExp);

    //Return number of results
    return (results !== null) ? results.length : 0;
  },

  /**Class helpers**/
  /**
   * String escape for use in RegExp expression
   * @param {string} str The RegExp string
   * @returns {string} The escape RegExp string
   */
  escapeRegExp: function(str) {
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
  txtContainer: document.getElementById('search_text'),
  searchInputID: document.getElementById('search_input'),
  searchSubmitID: document.getElementById('search_submit'),
  searchResultID: document.getElementById('search_result'),
  resultFoundTxt: 'Found %s occurances of the word \"%s\" in the below text.'
}

SearchClass.init(searchArgs);
