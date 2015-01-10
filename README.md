# AugmentedSSD
Augmented Reality App for SSD exam.
The application reads the information from the .sqlite through the class GAPServer opening a WebSocket but for convenience POIs are stored in a JSON string.
 contains the functions to load the POIs from the .sqlite.
<br/><br/>

## How To
To build the application run:
<pre><code>cordova build</code></pre>
or
<pre><code>phonegap build</code></pre>

To run the application run:
<pre><code>cordova run android</code></pre>
or
<pre><code>phonegap run android</code></pre>
This command looks for connected device, to run the application directly on the emulator (it will not works on it):
<pre><code>phonegap run android -e</code></pre>
or the command with "cordova".

The apk is in:
<pre><code>platforms/android/ant-build/CordovaApp-debug.apk (~10MB)</code></pre>

### Info
Course site: http://www3.csr.unibo.it/~maniezzo/didattica/DSS/SistSuppDec.html
