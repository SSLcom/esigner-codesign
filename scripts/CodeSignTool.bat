@echo OFF

set code_sign_tool_path=%CODE_SIGN_TOOL_PATH%

if defined code_sign_tool_path (
%code_sign_tool_path%\jdk-11.0.2\bin\java -Xmx@JVM_MAX_MEMORY -cp "%code_sign_tool_path%\jar\code_sign_tool-1.2.7.jar;%code_sign_tool_path%\jar\*" com.ssl.code.signing.tool.CodeSignTool %*
) else (
.\jdk-11.0.2\bin\java -Xmx@JVM_MAX_MEMORY -cp ".\jar\code_sign_tool-1.2.7.jar;.\jar\*" com.ssl.code.signing.tool.CodeSignTool %*
)
