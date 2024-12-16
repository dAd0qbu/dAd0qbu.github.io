import { _ as _export_sfc, r as resolveComponent, c as createElementBlock, a as createStaticVNode, e as createBaseVNode, f as createTextVNode, b as createVNode, o as openBlock } from "./app-BJjiZhLy.js";
const _imports_0 = "/assets/mysql-tcp-FC3Od3_N.png";
const _imports_1 = "/assets/mysql-tcp-1-DgA-hJCV.png";
const _imports_2 = "/assets/mysql-tcp-2-OTEgi6M1.png";
const _imports_3 = "/assets/mysql-tcp-3-CpCqpFRM.png";
const _imports_4 = "/assets/mysql-tcp-4-CTYJINzT.png";
const _imports_5 = "/assets/mysql-tcp-5-DAqG1Gsz.png";
const _imports_6 = "/assets/mysql-tcp-6-IE66rB46.png";
const _imports_7 = "/assets/mysql-tcp-7-CRMuihQr.png";
const _imports_8 = "/assets/mysql-tcp-8-DdVgGrL0.png";
const _sfc_main = {};
const _hoisted_1 = {
  href: "https://dev.mysql.com/doc/dev/mysql-server/latest/page_protocol_connection_phase_packets_protocol_handshake.html",
  target: "_blank",
  rel: "noopener noreferrer"
};
const _hoisted_2 = {
  href: "https://dev.mysql.com/doc/dev/mysql-server/latest/page_protocol_connection_phase_packets_protocol_handshake_response.html",
  target: "_blank",
  rel: "noopener noreferrer"
};
const _hoisted_3 = {
  href: "https://dev.mysql.com/doc/dev/mysql-server/latest/group__group__cs__capabilities__flags.html",
  target: "_blank",
  rel: "noopener noreferrer"
};
const _hoisted_4 = {
  href: "https://github.com/dAd0qbu/db-tcp-gen/",
  target: "_blank",
  rel: "noopener noreferrer"
};
const _hoisted_5 = {
  href: "https://dev.mysql.com/doc/dev/mysql-server",
  target: "_blank",
  rel: "noopener noreferrer"
};
function _sfc_render(_ctx, _cache) {
  const _component_ExternalLinkIcon = resolveComponent("ExternalLinkIcon");
  return openBlock(), createElementBlock("div", null, [
    _cache[26] || (_cache[26] = createStaticVNode('<h2 id="overview" tabindex="-1"><a class="header-anchor" href="#overview"><span>Overview</span></a></h2><p>Normal communication to MySQL server has two phases:</p><ul><li><strong>Connection phase</strong> where capabilities and authentication data are exchanged</li><li><strong>Query phase</strong> accepts commands from the client and executes them</li></ul><p>When a connection is established the server initiates a Connection Phase. Then it enters the Command Phase. The Command Phase ends when the connection terminates.</p><p><img src="' + _imports_0 + '" alt="alt text"> (We can ignore the ReplicationMode here)</p><h3 id="mysql-packets" tabindex="-1"><a class="header-anchor" href="#mysql-packets"><span>MySQL Packets</span></a></h3><p>If a MySQL client or server wants to send data, it:</p><ul><li>Splits the data into packets of size $2^{24}$ bytes</li><li>Prepends to each chunk a packet header</li></ul><table><thead><tr><th>Type</th><th>Name</th><th>Description</th></tr></thead><tbody><tr><td>int&lt;3&gt;</td><td>payload_length</td><td>Length of the payload</td></tr><tr><td>int&lt;1&gt;</td><td>sequence_id</td><td>sequence id, start at 0 and reset to 0 when begin new command</td></tr><tr><td>string&lt;var&gt;</td><td>payload</td><td>Payload of the packet</td></tr></tbody></table><p>Therefore, every payload must start with 4 bytes, 3 bytes length and 1 byte sequence_id (usually <code>0x00</code>)</p><h2 id="connection-phase" tabindex="-1"><a class="header-anchor" href="#connection-phase"><span>Connection Phase</span></a></h2><p>At this phase, the client and server will exchange the capabilities of each other (the server sends information that contains the protocol version, database version,...). The client also provide credential to authenticate in this phase. If successful, the server will respond <code>OK_PACKET</code>.</p>', 12)),
    createBaseVNode("p", null, [
      _cache[1] || (_cache[1] = createTextVNode("When connected, server will send ")),
      createBaseVNode("a", _hoisted_1, [
        _cache[0] || (_cache[0] = createTextVNode("Protocol::Handshake")),
        createVNode(_component_ExternalLinkIcon)
      ]),
      _cache[2] || (_cache[2] = createTextVNode(" (Initial Handshake), since 3.21.0, server will use protocol version 10. ")),
      _cache[3] || (_cache[3] = createBaseVNode("img", {
        src: _imports_1,
        alt: "alt text"
      }, null, -1)),
      _cache[4] || (_cache[4] = createTextVNode(" This packet contains server information and ")),
      _cache[5] || (_cache[5] = createBaseVNode("code", null, "auth_plugin_name", -1)),
      _cache[6] || (_cache[6] = createTextVNode(" which is usually ")),
      _cache[7] || (_cache[7] = createBaseVNode("code", null, "mysql_native_password", -1)),
      _cache[8] || (_cache[8] = createBaseVNode("img", {
        src: _imports_2,
        alt: "alt text"
      }, null, -1))
    ]),
    createBaseVNode("p", null, [
      _cache[10] || (_cache[10] = createTextVNode("After receiving the Server Initial Handshake Packet, the client will respond ")),
      createBaseVNode("a", _hoisted_2, [
        _cache[9] || (_cache[9] = createTextVNode("Protocol::HandshakeResponse41")),
        createVNode(_component_ExternalLinkIcon)
      ]),
      _cache[11] || (_cache[11] = createTextVNode(" with credentials for authenticating, here I use Plain Handshake so the SSL Connection can be skipped."))
    ]),
    _cache[27] || (_cache[27] = createBaseVNode("p", null, [
      createBaseVNode("img", {
        src: _imports_3,
        alt: "alt text"
      })
    ], -1)),
    _cache[28] || (_cache[28] = createBaseVNode("p", null, [
      createTextVNode("Here the payload when I tried to connect MySQL with username "),
      createBaseVNode("code", null, "user_OWxsp"),
      createTextVNode(", database "),
      createBaseVNode("code", null, "db_z0lKy"),
      createTextVNode(" and no password. "),
      createBaseVNode("img", {
        src: _imports_4,
        alt: "alt text"
      })
    ], -1)),
    createBaseVNode("ul", null, [
      _cache[19] || (_cache[19] = createBaseVNode("li", null, [
        createTextVNode("First 4 bytes "),
        createBaseVNode("code", null, "78 00 00 00 01"),
        createTextVNode(": Payload length and sequence id (sequence_id = 0 is Server Inital Handshake)")
      ], -1)),
      createBaseVNode("li", null, [
        _cache[13] || (_cache[13] = createTextVNode("4 bytes ")),
        _cache[14] || (_cache[14] = createBaseVNode("code", null, "8d a2 1a 00", -1)),
        _cache[15] || (_cache[15] = createTextVNode(": ")),
        createBaseVNode("a", _hoisted_3, [
          _cache[12] || (_cache[12] = createTextVNode("Capabilities Flags")),
          createVNode(_component_ExternalLinkIcon)
        ]),
        _cache[16] || (_cache[16] = createTextVNode(", hex value is 0x001aa28d, it can be converted to 32 bits ")),
        _cache[17] || (_cache[17] = createBaseVNode("code", null, "0000 0000 0001 1010 1010 0010 1000 1101", -1)),
        _cache[18] || (_cache[18] = createTextVNode(" to check which flag is enable."))
      ]),
      _cache[20] || (_cache[20] = createStaticVNode('<li>4 bytes <code>00 00 00 c0</code>: Max packet size, which is 192</li><li>1 byte <code>2d</code>: Character set, 0x2d = 45 (which corresponds to utf8mb4_general_ci) <img src="' + _imports_5 + '" alt="alt text"></li><li>23 bytes <code>00 00 .. 00 00</code>: Just a filler with 23 bytes 0x00</li><li>11 bytes <code>75 73 65 72 5f 4f 57 78 73 70 00</code>: Username and nullbyte for terminating</li><li>1 byte <code>00</code> (CLIENT_PLUGIN_AUTH_LENENC_CLIENT_DATA): Auth response (no auth response)</li><li>9 bytes <code>64 62 5f 7a 30 6c 4b 79 00</code> (CLIENT_CONNECT_WITH_DB): Database name and nullbyte</li><li>22 bytes <code>6d 79 .. 72 64 00</code> (CLIENT_PLUGIN_AUTH): The authentication method and nullbyte, I use <code>mysql_native_password</code></li><li>46 bytes <code>2c 0c .. 2e 31</code>: <ul><li>1 byte <code>2c</code>: Length of all attributes</li><li>13 bytes <code>0c 5f 63 6c 69 65 6e 74 5f 6e 61 6d 65</code>: 1 byte length and key (<code>_client_name</code>)</li><li>8 bytes <code>07 6d 79 73 71 6c 6e 64</code>: 1 byte length and value (<code>mysqlnd</code>) ...</li></ul></li>', 8))
    ]),
    _cache[29] || (_cache[29] = createStaticVNode('<p>In summary, in the Connection phase:</p><ol><li>Client connect to Server</li><li>Server send Protocol::Handshake</li><li>Client responds with Protocol::HandshakeResponse</li><li>Client and server possibly exchange further packets as required by the server authentication method for the user account the client is trying to authenticate against.</li><li>Server responds with OK_PACKET if successful</li></ol><h2 id="command-phase" tabindex="-1"><a class="header-anchor" href="#command-phase"><span>Command Phase</span></a></h2><p>Our query statement will be here. The commands can be one of 4 sub-protocols:</p><ul><li>Text Protocol</li><li>Utility Commands: connection close, ping, debug,...</li><li>Prepared Statements: for prepare statement</li><li>and Stored Programs.</li></ul><p>I will focus on the <code>Text Protocol</code> because it&#39;s used to send SQL queries easily.</p><h4 id="text-protocol" tabindex="-1"><a class="header-anchor" href="#text-protocol"><span>Text Protocol</span></a></h4><p><img src="' + _imports_6 + '" alt="alt text"></p><p>Example with easy query <code>SELECT &quot;test&quot;;</code><img src="' + _imports_7 + '" alt="alt text"></p><ul><li>First 4 bytes <code>0f 00 00 00</code>: Payload length and sequence id</li><li>1 byte <code>03</code>: Always 03 in COM_QUERY, Text Protocol</li><li>Final 14 bytes: My query, which is <code>SELECT &quot;test&quot;;</code></li></ul><p>If it were sent successfully, the Server would respond with a packet return value of the query.</p><h4 id="prepare-statement" tabindex="-1"><a class="header-anchor" href="#prepare-statement"><span>Prepare Statement</span></a></h4><p>Another way to send SQL queries is using Prepare Statement, but it&#39;s more complex than Text Protocol. Firstly, we need to send <code>COM_STMT_PREPARE</code> and then wait for the server to respond. We need to decode that response to get <code>statement_id</code>. Finally, we will <code>COM_STMT_EXECUTE</code> with <code>statement_id</code> from the previous.</p><h2 id="quit" tabindex="-1"><a class="header-anchor" href="#quit"><span>Quit</span></a></h2><p>After done, we can send <code>COM_QUIT</code> (Utility Commands) whose payload contains only 1 byte <code>01</code><img src="' + _imports_8 + '" alt="alt text"></p><h2 id="" tabindex="-1"><a class="header-anchor" href="#"><span></span></a></h2>', 16)),
    createBaseVNode("p", null, [
      _cache[22] || (_cache[22] = createTextVNode("The idea came from a CTF challenge in which I had to craft a TCP payload to query the MySQL database to the flag. I solved this by using the ")),
      _cache[23] || (_cache[23] = createBaseVNode("code", null, "tcpdump", -1)),
      _cache[24] || (_cache[24] = createTextVNode(" command to get raw payload requests to MySQL, I want to know how the payload is generated, so I am writing this blog. My script (gopherus use python2...): ")),
      createBaseVNode("a", _hoisted_4, [
        _cache[21] || (_cache[21] = createTextVNode("Github")),
        createVNode(_component_ExternalLinkIcon)
      ])
    ]),
    _cache[30] || (_cache[30] = createBaseVNode("h2", {
      id: "-1",
      tabindex: "-1"
    }, [
      createBaseVNode("a", {
        class: "header-anchor",
        href: "#-1"
      }, [
        createBaseVNode("span")
      ])
    ], -1)),
    createBaseVNode("ul", null, [
      createBaseVNode("li", null, [
        createBaseVNode("a", _hoisted_5, [
          _cache[25] || (_cache[25] = createTextVNode("https://dev.mysql.com/doc/dev/mysql-server")),
          createVNode(_component_ExternalLinkIcon)
        ])
      ])
    ])
  ]);
}
const mysqlTcp_html = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "mysql-tcp.html.vue"]]);
const data = JSON.parse('{"path":"/blogs/CTF/2024/mysql-tcp.html","title":"MySQL TCP Connection","lang":"en-US","frontmatter":{"title":"MySQL TCP Connection","description":"Something about how MySQL handle query request","date":"2024-06-16T00:00:00.000Z","categories":["Research"]},"headers":[{"level":2,"title":"Overview","slug":"overview","link":"#overview","children":[{"level":3,"title":"MySQL Packets","slug":"mysql-packets","link":"#mysql-packets","children":[]}]},{"level":2,"title":"Connection Phase","slug":"connection-phase","link":"#connection-phase","children":[]},{"level":2,"title":"Command Phase","slug":"command-phase","link":"#command-phase","children":[]},{"level":2,"title":"Quit","slug":"quit","link":"#quit","children":[]},{"level":2,"title":"","slug":"","link":"#","children":[]},{"level":2,"title":"","slug":"-1","link":"#-1","children":[]}],"git":{"createdTime":1734340044000,"updatedTime":1734340044000,"contributors":[{"name":"Phan Nguyen Huy Duy","email":"pnhd.dyh@gmail.com","commits":1}]},"filePathRelative":"blogs/CTF/2024/mysql-tcp.md"}');
export {
  mysqlTcp_html as comp,
  data
};
