/*
			Make By Square Studio The Owner Is JsonLz]Dev
*/

#include "CServerManager.h"
#include "dialog.h"

#include "main.h"

extern CDialogWindow *pDialogWindow;

#ifdef FLIN
	const CServerInstance::CServerInstanceEncrypted g_sEncryptedAddresses[MAX_SERVERS] = {
		CServerInstance::create(OBFUSCATE("51.68.107.75"), 1, 20, 11616, true),
		CServerInstance::create(OBFUSCATE("51.68.107.75"), 1, 20, 11616, true),
	};
#endif
