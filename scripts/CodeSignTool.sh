if [[ -z "${CODE_SIGN_TOOL_PATH}" ]]; then
  java -Xmx@JVM_MAX_MEMORY -cp "./jar/code_sign_tool-1.2.7.jar;./jar/*" com.ssl.code.signing.tool.CodeSignTool $@
else
  java -Xmx@JVM_MAX_MEMORY -cp "${CODE_SIGN_TOOL_PATH}/code_sign_tool-1.2.7.jar:${CODE_SIGN_TOOL_PATH}/jar/*" com.ssl.code.signing.tool.CodeSignTool $@
fi
