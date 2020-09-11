import * as buddy from 'co-body';
const forms = require('formidable');
const symbolUnparsed = Symbol.for('unparsedBody');

const jsonTypes = [
  'application/json',
  'application/json-patch+json',
  'application/vnd.api+json',
  'application/csp-report'
];

export default function requestbody(opts?: any) {
  opts = opts || {};
  opts.onError = 'onError' in opts ? opts.onError : false;
  opts.patchNode = 'patchNode' in opts ? opts.patchNode : false;
  opts.patchKoa = 'patchKoa' in opts ? opts.patchKoa : true;
  opts.multipart = 'multipart' in opts ? opts.multipart : false;
  opts.urlencoded = 'urlencoded' in opts ? opts.urlencoded : true;
  opts.json = 'json' in opts ? opts.json : true;
  opts.text = 'text' in opts ? opts.text : true;
  opts.encoding = 'encoding' in opts ? opts.encoding : 'utf-8';
  opts.jsonLimit = 'jsonLimit' in opts ? opts.jsonLimit : '1mb';
  opts.jsonStrict = 'jsonStrict' in opts ? opts.jsonStrict : true;
  opts.formLimit = 'formLimit' in opts ? opts.formLimit : '56kb';
  opts.queryString = 'queryString' in opts ? opts.queryString : null;
  opts.formidable = 'formidable' in opts ? opts.formidable : {};
  opts.includeUnparsed = 'includeUnparsed' in opts ? opts.includeUnparsed : false
  opts.textLimit = 'textLimit' in opts ? opts.textLimit : '56kb';

  // @todo: next major version, opts.strict support should be removed
  if (opts.strict && opts.parsedMethods) {
    throw new Error('Cannot use strict and parsedMethods options at the same time.')
  }

  if ('strict' in opts) {
    console.warn('DEPRECATED: opts.strict has been deprecated in favor of opts.parsedMethods.')
    if (opts.strict) {
      opts.parsedMethods = ['POST', 'PUT', 'PATCH']
    } else {
      opts.parsedMethods = ['POST', 'PUT', 'PATCH', 'GET', 'HEAD', 'DELETE']
    }
  }

  opts.parsedMethods = 'parsedMethods' in opts ? opts.parsedMethods : ['POST', 'PUT', 'PATCH']
  opts.parsedMethods = opts.parsedMethods.map(function (method: string) { return method.toUpperCase() })

  return function (ctx: any, next: Function) {
    let bodyPromise;
    // only parse the body on specifically chosen methods
    if (opts.parsedMethods.includes(ctx.method.toUpperCase())) {
      try {
        if (opts.json && ctx.is(jsonTypes)) {
          bodyPromise = buddy.json(ctx, {
            encoding: opts.encoding,
            limit: opts.jsonLimit,
            strict: opts.jsonStrict,
            returnRawBody: opts.includeUnparsed
          });
        } else if (opts.urlencoded && ctx.is('urlencoded')) {
          bodyPromise = buddy.form(ctx, {
            encoding: opts.encoding,
            limit: opts.formLimit,
            queryString: opts.queryString,
            returnRawBody: opts.includeUnparsed
          });
        } else if (opts.text && ctx.is('text/*')) {
          bodyPromise = buddy.text(ctx, {
            encoding: opts.encoding,
            limit: opts.textLimit,
            returnRawBody: opts.includeUnparsed
          });
        } else if (opts.multipart && ctx.is('multipart')) {
          bodyPromise = formy(ctx, opts.formidable);
        }
      } catch (parsingError) {
        if (typeof opts.onError === 'function') {
          opts.onError(parsingError, ctx);
        } else {
          throw parsingError;
        }
      }
    }

    bodyPromise = bodyPromise || Promise.resolve({});
    return bodyPromise.catch(function (parsingError) {
      if (typeof opts.onError === 'function') {
        opts.onError(parsingError, ctx);
      } else {
        throw parsingError;
      }
      return next();
    })
      .then(function (body: any) {
        if (opts.patchNode) {
          if (isMultiPart(ctx, opts)) {
            ctx.req.body = body.fields;
            ctx.req.files = body.files;
          } else if (opts.includeUnparsed) {
            ctx.req.body = body.parsed || {};
            if (!ctx.is('text/*')) {
              ctx.req.body[symbolUnparsed] = body.raw;
            }
          } else {
            ctx.req.body = body;
          }
        }
        if (opts.patchKoa) {
          if (isMultiPart(ctx, opts)) {
            ctx.request.body = body.fields;
            ctx.request.files = body.files;
          } else if (opts.includeUnparsed) {
            ctx.request.body = body.parsed || {};
            if (!ctx.is('text/*')) {
              ctx.request.body[symbolUnparsed] = body.raw;
            }
          } else {
            ctx.request.body = body;
          }
        }
        return next();
      })
  };
}

function isMultiPart(ctx: any, opts: any) {
  return opts.multipart && ctx.is('multipart');
}

function formy(ctx: any, opts: any) {
  return new Promise(function (resolve, reject) {
    let fields: any = {};
    let files: any = {};
    let form = new forms.IncomingForm(opts);
    form.on('end', function () {
      return resolve({
        fields: fields,
        files: files
      });
    }).on('error', function (err: any) {
      return reject(err);
    }).on('field', function (field: any, value: any) {
      if (fields[field]) {
        if (Array.isArray(fields[field])) {
          fields[field].push(value);
        } else {
          fields[field] = [fields[field], value];
        }
      } else {
        fields[field] = value;
      }
    }).on('file', function (field: any, file: any) {
      if (files[field]) {
        if (Array.isArray(files[field])) {
          files[field].push(file);
        } else {
          files[field] = [files[field], file];
        }
      } else {
        files[field] = file;
      }
    });
    if (opts.onFileBegin) {
      form.on('fileBegin', opts.onFileBegin);
    }
    form.parse(ctx.req);
  });
}