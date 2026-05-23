/*
			Make By Square Studio The Owner Is JsonLz]Dev
*/

#include "CServerManager.h"
#include "dialog.h"

#include "main.h"

extern CDialogWindow *pDialogWindow;

#ifdef FLIN
	const CServerInstance::CServerInstanceEncrypted g_sEncryptedAddresses[MAX_SERVERS] = {
		CServerInstance::create(OBFUSCATE("142.132.203.47"), 1, 20, 15613, false),
		CServerInstance::create(OBFUSCATE("142.132.203.47"), 1, 20, 15613, false),
	};
#endif
